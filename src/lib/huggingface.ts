// Use the local proxy path so the browser talks to the same origin.
// The dev server or the production server proxy should attach the
// Authorization header. Never put the API key in client bundles.
const API_URL = "/api/hf/models";

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
