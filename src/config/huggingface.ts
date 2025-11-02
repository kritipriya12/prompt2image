// Configuration for Hugging Face API
export const HUGGINGFACE_CONFIG = {
  // Base URL for Hugging Face API
  BASE_URL: 'https://api-inference.huggingface.co/models',
  
  // Default model to use for text-to-image generation
  DEFAULT_MODEL: 'black-forest-labs/FLUX.1-schnell',
  
  // Get API key from environment variables
  get API_KEY() {
    const key = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (!key) {
      console.error('Hugging Face API key is not configured. Please check your .env file.');
    }
    return key;
  },
  
  // Default request options
  get DEFAULT_OPTIONS() {
    return {
      wait_for_model: true,
      use_cache: false
    };
  },
  
  // Get headers for API requests
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.API_KEY}`
    };
  },
  
  // Validate API key by making a test request
  async validateApiKey() {
    if (!this.API_KEY) {
      return { valid: false, error: 'API key is not configured' };
    }
    
    try {
      const response = await fetch(`${this.BASE_URL}/${this.DEFAULT_MODEL}`, {
        headers: { 'Authorization': `Bearer ${this.API_KEY}` }
      });
      
      if (response.status === 401) {
        return { valid: false, error: 'Invalid API key' };
      }
      
      return { valid: response.ok };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Failed to validate API key' 
      };
    }
  }
} as const;
