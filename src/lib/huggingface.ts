const API_URL = "https://api-inference.huggingface.co/models";
const API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

if (!API_KEY) {
  console.warn("Hugging Face API key is not set. Please check your .env file.");
}

type ModelResponse = {
  generated_text?: string;
  error?: string;
  [key: string]: any;
};

export async function queryHuggingFace(
  modelId: string,
  inputs: any,
  parameters = {}
): Promise<ModelResponse> {
  try {
    const response = await fetch(`${API_URL}/${modelId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        inputs,
        parameters,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch from Hugging Face API");
    }

    return await response.json();
  } catch (error) {
    console.error("Error querying Hugging Face API:", error);
    throw error;
  }
}

// Example usage with a text generation model
export async function generateText(
  prompt: string,
  modelId = "gpt2"
): Promise<string> {
  const response = await queryHuggingFace(modelId, prompt);
  return response[0]?.generated_text || "No response generated";
}
