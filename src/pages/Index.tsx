import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Download, Image as ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const { 
    data, 
    loading: isGenerating, 
    error: generationError, 
    generateImage,
    checkApiKey
  } = useHuggingFace();

  // Check API key on component mount
  useEffect(() => {
    if (!checkApiKey()) {
      setApiError('Hugging Face API key is not configured. Please check your .env file.');
    } else {
      setApiError(null);
    }
  }, [checkApiKey]);

  // Handle generation errors
  useEffect(() => {
    if (generationError) {
      toast({
        title: "Generation failed",
        description: generationError,
        variant: "destructive",
      });
    }
  }, [generationError]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your image",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await generateImage(prompt);
      if (result?.url) {
        toast({
          title: "Success!",
          description: "Your image has been generated",
        });
      }
    } catch (error) {
      // Error is already handled by the hook
      console.error("Generation error:", error);
    }
  };

  const downloadImage = () => {
    if (data?.url) {
      const a = document.createElement("a");
      a.href = data.url;
      a.download = `ai-generated-${Date.now()}.png`;
      a.click();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000 leading-tight">
            Create Stunning Images
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            Transform your ideas into beautiful images using AI
          </p>
        </div>

        {/* API Key Error Alert */}
        {apiError && (
          <Alert variant="destructive" className="mb-8 max-w-3xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Key Error</AlertTitle>
            <AlertDescription className="text-left">
              <p className="mb-2">{apiError}</p>
              <p className="text-sm">
                Create a <code className="bg-muted px-1 rounded">.env</code> file in your project root with:
              </p>
              <pre className="bg-muted p-2 rounded mt-2 overflow-x-auto text-sm">
                VITE_HUGGINGFACE_API_KEY=your_api_key_here
              </pre>
              <p className="mt-2 text-sm">
                Then restart your development server.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto animate-in fade-in duration-1000 delay-300">
          {/* Input Section */}
          <Card className="p-6 space-y-6 backdrop-blur-sm bg-card/50 border-2 border-border hover:border-primary/50 transition-all duration-300">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Describe your image
              </label>
              <Textarea
                placeholder="A serene landscape with mountains at sunset, highly detailed, 4k quality..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[200px] bg-background/50 resize-none"
                disabled={!!apiError}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !!apiError}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </Card>

          {/* Output Section */}
          <Card className="p-6 backdrop-blur-sm bg-card/50 border-2 border-border hover:border-primary/50 transition-all duration-300">
            <div className="space-y-4">
              <label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                Generated Image
              </label>
              
              <div className="aspect-square rounded-lg border-2 border-dashed border-border bg-background/30 overflow-hidden">
                {isGenerating ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Creating your image...</p>
                  </div>
                ) : data?.url ? (
                  <img
                    src={data.url}
                    alt="Generated from prompt"
                    className="w-full h-full object-contain animate-in fade-in duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <ImageIcon className="w-16 h-16 opacity-20" />
                    <p className="text-sm">Your image will appear here</p>
                  </div>
                )}
              </div>

              {data?.url && !isGenerating && (
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  className="w-full border-primary/50 hover:bg-primary/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
