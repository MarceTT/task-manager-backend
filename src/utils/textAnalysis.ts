import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string, // Usa la clave de tu archivo `.env`
});

export const analyzeComment = async (comment: string): Promise<string> => {
  const prompt = `
    Analyze the following task comment and suggest improvements:
    Comment: "${comment}"
    Suggestions:
  `;

  const response = await openai.completions.create({
    model: "text-davinci-003",
    prompt,
    max_tokens: 100,
  });

  return response.choices[0]?.text?.trim() || "No suggestions available.";
};
