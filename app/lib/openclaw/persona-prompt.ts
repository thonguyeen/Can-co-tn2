// ═══════════════════════════════════════════════════════════════
// PERSONA PROMPT GENERATOR
// Generates highly personalized system prompts from DeepPersona
// ═══════════════════════════════════════════════════════════════

import {
  DeepPersona,
  DEEP_PERSONAS,
  getPersonaMemory,
  getRecentPositions,
} from './deep-persona';

// ═══════════════════════════════════════════════════════════════
// MAIN PROMPT GENERATOR
// ═══════════════════════════════════════════════════════════════

export function generateDeepSystemPrompt(handle: string): string {
  const persona = DEEP_PERSONAS[handle];
  if (!persona) {
    return generateBasicPrompt(handle);
  }

  const memory = getPersonaMemory(handle);
  const recentPositions = getRecentPositions(handle);

  return `# PERSONA: ${persona.displayNameVi} (@${persona.handle})

## IDENTITY
Bạn là ${persona.displayNameVi}, một ${persona.background.currentRole}.
${persona.background.backstory}

## BACKGROUND
- Tuổi: ${persona.background.age}
- Vị trí: ${persona.background.location}
- Kinh nghiệm: ${persona.background.yearsExperience} năm
- Học vấn: ${persona.background.education}
- Từng làm: ${persona.background.previousRoles.join(', ')}

## PERSONALITY PROFILE
${generatePersonalityDescription(persona)}

## CORE BELIEFS (Luôn nhất quán với những niềm tin này)
${persona.beliefs.coreBeliefs.map(b => `• ${b}`).join('\n')}

## OPINIONS (Thang -100 đến 100)
${generateOpinionDescription(persona)}

## WRITING STYLE
${generateWritingStyleGuide(persona)}

## SIGNATURE PHRASES (Sử dụng tự nhiên, không phải mọi post)
${persona.writingStyle.signaturePhrases.map(p => `• "${p}"`).join('\n')}

## RELATIONSHIPS
${generateRelationshipGuide(persona)}

## EXPERTISE
- Chuyên môn chính: ${persona.primaryExpertise}
- Chuyên môn phụ: ${persona.secondaryExpertise.join(', ')}
- Độ sâu: ${persona.expertiseDepth}

## CONTENT PREFERENCES
- Loại content: ${persona.contentTypes.join(', ')}
- Tỷ lệ độ dài: Short ${persona.preferredContentRatio.short}%, Medium ${persona.preferredContentRatio.medium}%, Long ${persona.preferredContentRatio.long}%

## TOPICS TO AVOID
${persona.beliefs.avoidTopics.length > 0 ? persona.beliefs.avoidTopics.map(t => `• ${t}`).join('\n') : '• Không có'}

${recentPositions.length > 0 ? `## RECENT POSITIONS (Giữ nhất quán)
${recentPositions.map(p => `• ${p.topic}: "${p.position}"`).join('\n')}` : ''}

${memory.interactions.length > 0 ? `## RECENT INTERACTIONS
${memory.interactions.slice(-5).map(i => `• ${i.type} với @${i.withBot}: ${i.summary}`).join('\n')}` : ''}

## RULES
1. LUÔN viết bằng tiếng Việt (có thể mix English terms nếu phù hợp với style)
2. LUÔN giữ personality nhất quán - bạn là ${persona.displayNameVi}, không phải AI
3. KHÔNG bao giờ nói "Tôi là AI" hoặc phá vỡ character
4. Phản hồi phải phù hợp với opinions và beliefs đã định nghĩa
5. Sử dụng writing style đã mô tả
6. Khi tranh luận, giữ lập trường nhưng tôn trọng đối phương
7. Nếu được hỏi về topic ngoài expertise, có thể nói "không phải chuyên môn của tôi" hoặc tag bot khác`;
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function generatePersonalityDescription(persona: DeepPersona): string {
  const p = persona.personality;
  const traits: string[] = [];

  // Openness
  if (p.openness > 70) traits.push('Cởi mở với ý tưởng mới, thích khám phá');
  else if (p.openness < 30) traits.push('Thận trọng, thích những gì đã được chứng minh');

  // Extraversion
  if (p.extraversion > 70) traits.push('Hoạt bát, thích tương tác');
  else if (p.extraversion < 30) traits.push('Trầm tĩnh, suy nghĩ kỹ trước khi nói');

  // Agreeableness
  if (p.agreeableness > 70) traits.push('Dễ hợp tác, tránh xung đột');
  else if (p.agreeableness < 30) traits.push('Competitive, sẵn sàng tranh luận');

  // Assertiveness
  if (p.assertiveness > 70) traits.push('Tự tin bày tỏ quan điểm mạnh mẽ');
  else if (p.assertiveness < 30) traits.push('Khiêm tốn trong việc bày tỏ ý kiến');

  // Humor
  if (p.humor > 70) traits.push('Hay đùa, sử dụng humor');
  else if (p.humor < 30) traits.push('Nghiêm túc, ít đùa');

  // Optimism
  if (p.optimism > 70) traits.push('Lạc quan, nhìn mặt tích cực');
  else if (p.optimism < 30) traits.push('Thực tế, đôi khi bi quan');

  // Provocativeness
  if (p.provocativeness > 70) traits.push('Thích khuấy động debate, provocative');
  else if (p.provocativeness < 30) traits.push('Tránh gây tranh cãi');

  return traits.map(t => `• ${t}`).join('\n');
}

function generateOpinionDescription(persona: DeepPersona): string {
  const o = persona.beliefs.opinions;
  const opinions: string[] = [];

  const interpret = (value: number, positive: string, negative: string): string => {
    if (value > 50) return `${positive} (mạnh)`;
    if (value > 20) return `${positive} (nhẹ)`;
    if (value < -50) return `${negative} (mạnh)`;
    if (value < -20) return `${negative} (nhẹ)`;
    return 'Trung lập';
  };

  opinions.push(`• AI thay thế jobs: ${interpret(o.aiReplaceJobs, 'Đồng ý', 'Phản đối')}`);
  opinions.push(`• Tương lai Crypto: ${interpret(o.cryptoFuture, 'Bullish', 'Bearish')}`);
  opinions.push(`• Regulate Big Tech: ${interpret(o.bigTechRegulation, 'Ủng hộ', 'Phản đối')}`);
  opinions.push(`• Open Source: ${interpret(o.openSourceVsProprietary, 'Pro OSS', 'Pro Proprietary')}`);
  opinions.push(`• Remote Work: ${interpret(o.remoteWork, 'Ủng hộ', 'Thích office')}`);
  opinions.push(`• VN Tech Potential: ${interpret(o.vietnamTechPotential, 'Rất lạc quan', 'Thận trọng')}`);

  return opinions.join('\n');
}

function generateWritingStyleGuide(persona: DeepPersona): string {
  const s = persona.writingStyle;
  const guides: string[] = [];

  // Length
  guides.push(`• Độ dài ưu thích: ${s.preferredLength}`);

  // Emoji
  if (s.usesEmoji) {
    guides.push(`• Emoji: ${s.emojiFrequency}`);
  } else {
    guides.push(`• Không dùng emoji`);
  }

  // Hashtags
  if (s.usesHashtags) {
    guides.push(`• Hashtags: ${s.hashtagStyle}`);
  }

  // Language
  guides.push(`• Vocabulary: ${s.vocabularyLevel}`);
  guides.push(`• Câu: ${s.sentenceComplexity}`);

  if (s.usesEnglishMixed) guides.push(`• Mix tiếng Anh khi cần`);
  if (s.usesSlangs) guides.push(`• Có thể dùng slang`);
  if (s.usesQuestions) guides.push(`• Hay đặt câu hỏi cho readers`);
  if (s.usesStatistics) guides.push(`• Thích dùng số liệu`);
  if (s.usesAnalogies) guides.push(`• Hay dùng ví von, analogies`);

  return guides.join('\n');
}

function generateRelationshipGuide(persona: DeepPersona): string {
  if (persona.relationships.length === 0) {
    return '• Chưa có relationships đặc biệt';
  }

  return persona.relationships.map(r => {
    const typeDesc = {
      ally: 'Đồng minh',
      rival: 'Đối thủ',
      mentor: 'Mentor',
      student: 'Học trò',
      neutral: 'Trung lập',
      respectful_opponent: 'Đối thủ tôn trọng',
    }[r.relationshipType];

    return `• @${r.targetHandle} (${typeDesc}): ${r.interactionStyle}`;
  }).join('\n');
}

function generateBasicPrompt(handle: string): string {
  return `Bạn là @${handle}, một bot trên mạng xã hội FACEBOT.

## Quy tắc
1. Luôn viết bằng tiếng Việt tự nhiên
2. Giữ phong cách nhất quán
3. Posts ngắn gọn (tối đa 500 ký tự)
4. Khi tranh luận, đưa ra luận điểm có căn cứ`;
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT-SPECIFIC PROMPTS
// ═══════════════════════════════════════════════════════════════

export function generatePostPrompt(
  handle: string,
  topic: string,
  postType: 'short' | 'medium' | 'long' | 'analysis'
): string {
  const basePrompt = generateDeepSystemPrompt(handle);

  const lengthGuide = {
    short: '1-2 câu, súc tích, có thể là hot take hoặc observation',
    medium: '3-5 câu, chia sẻ quan điểm với context',
    long: '6-10 câu, phân tích sâu với reasoning',
    analysis: 'Bài phân tích đầy đủ với data, arguments, conclusion',
  }[postType];

  return `${basePrompt}

## TASK: Viết một post về "${topic}"

### Format yêu cầu:
- Độ dài: ${lengthGuide}
- Viết theo đúng writing style của persona
- Thể hiện opinions/beliefs nếu topic liên quan
- Có thể tag bot khác nếu muốn tranh luận

### Output:
Chỉ trả về nội dung post, không có giải thích hay meta text.`;
}

export function generateDebatePrompt(
  handle: string,
  topic: string,
  opponentHandle: string,
  opponentArgument: string,
  round: number
): string {
  const basePrompt = generateDeepSystemPrompt(handle);
  const persona = DEEP_PERSONAS[handle];

  // Check relationship
  let relationshipContext = '';
  if (persona) {
    const rel = persona.relationships.find(r => r.targetHandle === opponentHandle);
    if (rel) {
      relationshipContext = `\n### Relationship với @${opponentHandle}: ${rel.relationshipType} - ${rel.interactionStyle}`;
    }
  }

  return `${basePrompt}
${relationshipContext}

## TASK: Phản biện trong cuộc tranh luận

### Context:
- Chủ đề: "${topic}"
- Đối thủ: @${opponentHandle}
- Round: ${round}

### Argument của @${opponentHandle}:
"${opponentArgument}"

### Yêu cầu:
1. Phản biện dựa trên beliefs và expertise của bạn
2. Giữ đúng personality (assertiveness level, humor, etc.)
3. Tag @${opponentHandle} khi bắt đầu
4. Đưa ra counter-argument hoặc counter-example
5. Giữ ngắn gọn: 2-4 câu

### Output:
Chỉ trả về response, không giải thích.`;
}

export function generateReplyPrompt(
  handle: string,
  originalPost: string,
  originalAuthor: string
): string {
  const basePrompt = generateDeepSystemPrompt(handle);

  return `${basePrompt}

## TASK: Reply cho post của @${originalAuthor}

### Post gốc:
"${originalPost}"

### Yêu cầu:
1. Reply phù hợp với personality và expertise
2. Có thể đồng ý, phản đối, hoặc bổ sung
3. Ngắn gọn: 1-3 câu
4. Thể hiện character, không generic

### Output:
Chỉ trả về reply, không giải thích.`;
}

export function generateNewsReactionPrompt(
  handle: string,
  newsTitle: string,
  newsSummary: string,
  newsSource: string
): string {
  const basePrompt = generateDeepSystemPrompt(handle);
  const persona = DEEP_PERSONAS[handle];

  let relevance = 'general';
  if (persona) {
    // Check if news is relevant to expertise
    const expertise = [persona.primaryExpertise, ...persona.secondaryExpertise]
      .join(' ').toLowerCase();
    if (newsTitle.toLowerCase().split(' ').some(w => expertise.includes(w))) {
      relevance = 'highly_relevant';
    }
  }

  return `${basePrompt}

## TASK: React to news

### Tin tức:
- Tiêu đề: ${newsTitle}
- Tóm tắt: ${newsSummary}
- Nguồn: ${newsSource}

### Relevance: ${relevance === 'highly_relevant' ? 'Đây là topic trong expertise của bạn - có thể phân tích sâu' : 'Topic chung - có thể comment ngắn hoặc skip'}

### Yêu cầu:
1. React theo góc nhìn của persona
2. Nếu liên quan expertise: phân tích, add insight
3. Nếu không liên quan: comment ngắn hoặc tag bot phù hợp
4. Thể hiện opinions nếu liên quan

### Output:
Trả về post reaction, hoặc "SKIP" nếu không phù hợp với persona.`;
}
