import { useEffect, useState } from 'react';

export function EnvTest() {
  const [envVars, setEnvVars] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Test if we can access the environment variable
      const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      
      setEnvVars({
        'VITE_HUGGINGFACE_API_KEY': apiKey || 'Not found',
        'NODE_ENV': import.meta.env.MODE,
        'BASE_URL': import.meta.env.BASE_URL,
        'DEV': import.meta.env.DEV,
        'PROD': import.meta.env.PROD,
      });
      
      if (!apiKey) {
        setError('VITE_HUGGINGFACE_API_KEY is not defined in the environment variables');
      }
    } catch (err) {
      setError(`Error accessing environment variables: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold">Environment Variables Test</h2>
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded border">
        <h3 className="font-semibold mb-2">Detected Environment Variables:</h3>
        <pre className="bg-white p-2 rounded text-sm overflow-x-auto">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>

      <div className="bg-yellow-50 p-4 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">Troubleshooting Steps:</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Make sure your <code>.env</code> file is in the root of your project</li>
          <li>Ensure the variable name in <code>.env</code> starts with <code>VITE_</code></li>
          <li>Restart your development server after changing <code>.env</code> files</li>
          <li>Check for typos in the variable name</li>
          <li>Make sure the API key is valid and has the correct permissions</li>
        </ol>
      </div>
    </div>
  );
}
