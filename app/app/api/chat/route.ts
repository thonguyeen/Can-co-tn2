import { NextResponse } from 'next/server';
import { chat } from '@/lib/ai/client';

export const maxDuration = 60; // Allow 60s max for AI response

const SYSTEM_PROMPT = `Bạn là NHA.AI - Trợ lý ảo môi giới BĐS thông minh của nền tảng mạng xã hội CẦN & CÓ.
Nhiệm vụ của bạn là tư vấn cho người dùng về giá cả, xu hướng thị trường, hoặc cách sử dụng ứng dụng.
Quy tắc:
1. Luôn vui vẻ, lịch sự và sử dụng icon (emoji) tự nhiên.
2. Trả lời NGẮN GỌN, đi thẳng vào trọng tâm (tối đa 4 câu).
3. Nếu người dùng hỏi ngoài lề (không phải BĐS, nhà cửa, nội thất, hay ứng dụng CẦN & CÓ), hãy khéo léo từ chối và lái câu chuyện về BĐS.
4. Đừng tự ý xuất Markdown phức tạp, chỉ cần bôi đậm (**) và ngắt dòng hợp lý.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, error: 'Invalid messages array' }, { status: 400 });
    }

    // Format the conversation history into a single string for simple OpenAI prompt
    // Actually, our chat() in lib/ai/client.ts only takes (systemPrompt, userMessage)!
    // To maintain context without rewriting the whole client.ts, we'll serialize the history as the userMessage context.
    
    let conversationContext = "Dưới đây là lịch sử hội thoại gần nhất:\n";
    messages.slice(-5).forEach((msg: any) => {
      conversationContext += `${msg.role === 'user' ? 'Người dùng' : 'NHA.AI'}: ${msg.text}\n`;
    });
    conversationContext += "\nDựa trên lịch sử trên, hãy trả lời tin nhắn cuối cùng của người dùng.";

    // Call our LLM wrapper
    const responseText = await chat(SYSTEM_PROMPT, conversationContext);

    return NextResponse.json({
      success: true,
      data: {
        text: responseText,
      }
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi hệ thống AI.' },
      { status: 500 }
    );
  }
}
