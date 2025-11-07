# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e29474f3-053a-4131-bda3-c0837885abfb

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e29474f3-053a-4131-bda3-c0837885abfb) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e29474f3-053a-4131-bda3-c0837885abfb) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Production: securely calling the Hugging Face Inference API

The Hugging Face Inference API does not include Access-Control-Allow-Origin headers that allow direct browser requests (and you should never embed your API key in a public frontend). For production, run a small server-side proxy that keeps your Hugging Face API key secret and forwards requests from the browser to the Hugging Face API.

Quick example (included in this repo under `server/server.js`):

- Put your API key in a `.env` file (see `.env.example`).
- Start the proxy: `node server/server.js` (you can add a PM2/systemd/nodemon wrapper for production).
- In your frontend, send requests to your backend proxy at `/api/hf/models/...` (the proxy will forward these to the Hugging Face router endpoint `https://router.huggingface.co/hf-inference/models/...`).

Security notes:
- Always store `HUGGINGFACE_API_KEY` on the server (environment variable or secret manager). Do not commit it to source control.
- Restrict the proxy to accept requests only from your frontend origin (configure `ALLOWED_ORIGIN` in `.env` and/or tighten CORS in `server/server.js`).
- Add rate-limiting and authentication in front of the proxy to avoid abuse and unexpected billing.

Alternative approaches:
- Use Hugging Face client libraries (server-side) such as `@huggingface/inference` or `huggingface_hub` when building server apps.
- Use provider-specific serverless functions (Vercel, Netlify Functions, AWS Lambda) to implement the proxy.

This repo includes a minimal example proxy to get you started. If you want, I can:

- Add an opinionated express + rate-limiter + helmet example and update `package.json` scripts.
- Add a serverless function example for Vercel / Netlify.
- Wire up a small authenticated endpoint so your frontend has to include a temporary token to call the proxy.

