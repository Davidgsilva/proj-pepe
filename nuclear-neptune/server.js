// server.js - Custom server for Astro.js in Cloud Run
import { handler as ssrHandler } from './dist/server/entry.mjs';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;

const app = express();

// Serve static files from the dist/client directory
app.use(express.static(join(__dirname, 'dist/client')));

// Use the SSR handler for all other routes
app.use(ssrHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
