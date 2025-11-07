import { useState, useCallback } from 'react';
import { HUGGINGFACE_CONFIG } from '@/config/huggingface';

type ApiResponse<T = unknown> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

type GenerateImageResponse = {
  blob: Blob | null;
  url: string | null;
};

export function useHuggingFace() {
  const [state, setState] = useState<ApiResponse>({
    data: null,
    error: null,
    loading: false,
  });

  // Check if API key is configured
  const checkApiKey = useCallback(() => {
    // Note: API keys should live on the server/proxy. This helper simply
    // returns whether a client-side env var exists (not recommended).
    return !!HUGGINGFACE_CONFIG.API_KEY;
  }, []);

  // Generate image from text prompt
  const generateImage = useCallback(
    async (prompt: string, modelId: string = HUGGINGFACE_CONFIG.DEFAULT_MODEL) => {
      if (!prompt.trim()) {
        throw new Error('Prompt cannot be empty');
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Send request to proxied path; the server proxy attaches the HF API key.
        const response = await fetch(`${HUGGINGFACE_CONFIG.BASE_URL}/${modelId}`, {
          method: 'POST',
          headers: HUGGINGFACE_CONFIG.getHeaders(),
          body: JSON.stringify({
            inputs: prompt,
            options: HUGGINGFACE_CONFIG.DEFAULT_OPTIONS,
          }),
        });

        if (!response.ok) {
          // Provide a clearer message for 401 so developers know the proxy
          // didn't attach a valid Authorization header (common in dev).
          if (response.status === 401) {
            const serverHint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
              ? 'Make sure your dev proxy or server is running and HUGGINGFACE_API_KEY is set in the environment.'
              : 'Ensure your production proxy is attaching a valid Hugging Face API key.';

            throw new Error(
              `API Error: 401 Unauthorized — upstream rejected the request. ${serverHint}`
            );
          }

          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `API Error: ${response.status} ${response.statusText}`
          );
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        setState(prev => ({
          ...prev,
          data: { blob, url },
          loading: false,
        }));

        return { blob, url };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        throw error;
      }
    },
    []
  );

  // Text generation function
  const generateText = useCallback(
    async (prompt: string, modelId: string = 'gpt2') => {
      if (!prompt.trim()) {
        throw new Error('Prompt cannot be empty');
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(
          `${HUGGINGFACE_CONFIG.BASE_URL}/${modelId}`,
          {
            method: 'POST',
            headers: HUGGINGFACE_CONFIG.getHeaders(),
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                max_length: 100,
                num_return_sequences: 1,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `API Error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setState(prev => ({
          ...prev,
          data,
          loading: false,
        }));

        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate text';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        throw error;
      }
    },
    []
  );

  return {
    // State
    data: state.data,
    loading: state.loading,
    error: state.error,
    
    // Methods
    generateImage,
    generateText,
    checkApiKey,
    
    // Reset state
    reset: () => setState({ data: null, error: null, loading: false }),
  };
}
