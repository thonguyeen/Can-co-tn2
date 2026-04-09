require('dotenv').config({ path: '.env.local' });
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

async function main() {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'cb1',
      max_tokens: 2048,
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'hello' },
      ],
    });
    console.log("Success:", response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    if (error.response) {
      console.error(error.response.data);
    }
  }
}
main();
