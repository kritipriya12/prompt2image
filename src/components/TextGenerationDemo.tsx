import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHuggingFace } from '@/hooks/useHuggingFace';

export function TextGenerationDemo() {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const { loading, error, generate } = useHuggingFace();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    try {
      const result = await generate(prompt);
      setGeneratedText(result);
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Text Generation with Hugging Face</h2>
      
      <div className="flex gap-2">
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
          className="flex-1"
          disabled={loading}
        />
        <Button 
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
        >
          {loading ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {generatedText && (
        <div className="mt-6 p-4 bg-gray-50 border rounded">
          <h3 className="font-semibold mb-2">Generated Text:</h3>
          <p className="whitespace-pre-wrap">{generatedText}</p>
        </div>
      )}
    </div>
  );
}
