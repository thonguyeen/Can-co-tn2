const { OpenAI } = require("openai");

const client = new OpenAI({
  // Key xịn của 9router
  apiKey: "sk-bdea2f952ada2b73-rkssyn-7a889b08",
  // URL mà anh muốn test
  baseURL: "http://103.6.169.119:20128/v1", 
});

async function main() {
  console.log("⏳ Bắt đầu gọi API tới 9Router...");
  console.time("Thời gian phản hồi");
  
  try {
    // CODE SỬA LỖI: Chuẩn OpenAI bắt buộc dùng chat.completions.create và gửi chuỗi messages
    const responseStream = await client.chat.completions.create(
      {
        model: "cb1",
        messages: [{ role: "user", content: "Chào cậu, cậu khỏe không?" }],
        stream: true,
      }, 
      { timeout: 10000 } // Tự động ngắt nếu server ngâm quá 10 giây (khỏi lo bị treo máy)
    );

    console.log("✅ Thành công lấy được Data! Bot đang gõ chữ:\n");
    for await (const chunk of responseStream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
    
    console.log("\n");
  } catch (error) {
    console.log("\n❌ PHÁT HIỆN LỖI TỪ SERVER DỘI VỀ:");
    console.error("->", error.message);
  } finally {
    console.timeEnd("Thời gian phản hồi");
  }
}

main();
