import express from 'express';
import dotenv from 'dotenv';

// Load environment variables from .env when present
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HF_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// Keep payloads reasonable
app.use(express.json({ limit: '10mb' }));

// Support a comma-separated list of allowed origins. If ALLOWED_ORIGIN is a
// single origin (or '*') the behavior is unchanged. For multiple origins we
// echo back the request's Origin header when it's in the allow list.
const _allowedOrigins = ALLOWED_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);

app.use((req, res, next) => {
	const origin = req.get('Origin');

	if (_allowedOrigins.length === 0 || _allowedOrigins.includes('*')) {
		res.setHeader('Access-Control-Allow-Origin', '*');
	} else if (origin && _allowedOrigins.includes(origin)) {
		// Echo the allowed origin back for CORS and vary on Origin
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Vary', 'Origin');
	} else {
		// Not an allowed origin — respond with null (no access) for browsers.
		// We still allow the request to proceed server-side; you can change
		// this to reject requests if you prefer.
		res.setHeader('Access-Control-Allow-Origin', 'null');
	}

	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
	if (req.method === 'OPTIONS') return res.sendStatus(204);
	next();
});

if (!HF_KEY) {
	console.warn('Warning: HUGGINGFACE_API_KEY (or HF_TOKEN) is not set. Requests will fail without a valid key.');
}

// Proxy endpoint for Hugging Face Inference API
// Forwards requests from /api/hf/* -> https://router.huggingface.co/hf-inference/*
app.all('/api/hf/*', async (req, res) => {
	try {
		const downstreamPath = req.path.replace(/^\/api\/hf/, ''); // e.g. /models/...
		// The old api-inference host is deprecated. Use the Hugging Face router
		// hf-inference endpoint instead. Forward to:
		// https://router.huggingface.co/hf-inference{downstreamPath}
		const url = `https://router.huggingface.co/hf-inference${downstreamPath}`;

		// Build headers for downstream request. Ensure Authorization is set from server env.
		const headers = {
			// prefer client's content-type when present
			'Content-Type': req.get('Content-Type') || 'application/json',
		};

		if (HF_KEY) {
			headers['Authorization'] = `Bearer ${HF_KEY}`;
		}

		// Prepare body for non-GET requests
		let body = undefined;
		if (!['GET', 'HEAD'].includes(req.method)) {
			// If body was parsed by express.json, re-stringify it. Otherwise empty body.
			body = Object.keys(req.body || {}).length ? JSON.stringify(req.body) : undefined;
		}

		const fetchRes = await fetch(url, {
			method: req.method,
			headers,
			body,
		});

		// Forward status and content-type
		res.status(fetchRes.status);
		const contentType = fetchRes.headers.get('content-type');
		if (contentType) res.set('Content-Type', contentType);

		// Stream/pipe the response body back to the client
		const ab = await fetchRes.arrayBuffer();
		res.send(Buffer.from(ab));
	} catch (err) {
		console.error('Proxy error:', err);
		res.status(500).json({ error: err instanceof Error ? err.message : 'Proxy error' });
	}
});

app.listen(PORT, () => {
		console.log(`HF proxy server listening on http://localhost:${PORT} (proxying /api/hf -> router.huggingface.co/hf-inference)`);
});
