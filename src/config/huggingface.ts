// Configuration for Hugging Face API
export const HUGGINGFACE_CONFIG = {
  // Base URL for Hugging Face API.
  // Use the local proxy path so the browser talks to the same origin in dev/prod.
  // The server proxy will add the Authorization header before forwarding.
  BASE_URL: '/api/hf/models',
  
  // Default model to use for text-to-image generation
  DEFAULT_MODEL: 'stabilityai/stable-diffusion-xl-base-1.0',
  
  // Client should not include the Hugging Face API key; the server proxy will
  // attach the Authorization header. Keep this getter for diagnostics only.
  get API_KEY() {
    return import.meta.env.VITE_HUGGINGFACE_API_KEY || null;
  },
  
  // Default request options
  get DEFAULT_OPTIONS() {
    return {
      wait_for_model: true,
      use_cache: false
    };
  },
  
  // Get headers for API requests. Do NOT add Authorization here — the server
  // proxy should provide the key. This keeps the key out of the client bundle.
  getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  },
  
  // Client-side validation is a no-op because API keys live on the server.
  // If you want server-side validation, implement a /api/hf/validate endpoint
  // that checks the key with Hugging Face and returns the result.
  async validateApiKey() {
    return { valid: true };
  }
} as const;
