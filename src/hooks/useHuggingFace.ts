import { useState, useCallback } from 'react';
import { HUGGINGFACE_CONFIG } from '@/config/huggingface';

type ApiResponse<T = any> = {
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
        // First validate the API key
        const { valid, error } = await HUGGINGFACE_CONFIG.validateApiKey();
        if (!valid) {
          throw new Error(error || 'Invalid API key');
        }

        const response = await fetch(
          `${HUGGINGFACE_CONFIG.BASE_URL}/${modelId}`,
          {
            method: 'POST',
            headers: HUGGINGFACE_CONFIG.getHeaders(),
            body: JSON.stringify({
              inputs: prompt,
              options: HUGGINGFACE_CONFIG.DEFAULT_OPTIONS,
            }),
          }
        );

        if (!response.ok) {
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
