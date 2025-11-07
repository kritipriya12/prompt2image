// Use the local proxy path so the browser talks to the same origin.
// The dev server or the production server proxy should attach the
// Authorization header. Never put the API key in client bundles.
const API_URL = "/api/hf/models";

type ModelResponse = {
  generated_text?: string;
  error?: string;
  [key: string]: unknown;
};

export async function queryHuggingFace(
  modelId: string,
  inputs: unknown,
  parameters: Record<string, unknown> = {}
): Promise<ModelResponse | unknown> {
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

    const json = await response.json();
    return json as unknown;
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
  // The response shape may vary between models. Check for an array
  // with an object that contains `generated_text`.
  if (Array.isArray(response) && response.length > 0) {
    const first = response[0] as Record<string, unknown>;
    const txt = first.generated_text;
    if (typeof txt === 'string') return txt;
  }

  // If not an array, but an object with generated_text
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    const txt = obj.generated_text;
    if (typeof txt === 'string') return txt;
  }

  return 'No response generated';
}
