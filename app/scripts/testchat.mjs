import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-bdea2f952ada2b73-rkssyn-7a889b08",
  baseURL: process.env.OPENAI_BASE_URL || "https://r7vabjy.9router.com/v1",
});

async function main() {
  try {
      const stream = await client.responses.create({
        model: process.env.MODEL || "cb1",
        input: "Viết 1 đoạn chào ngắn bằng tiếng Việt.",
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
          process.stdout.write(event.delta);
        }
      }

      process.stdout.write("\n");
  } catch (error) {
      console.error("API call failed:");
      console.error(error);
  }
}

main().catch(console.error);
