// server.js - Entry point for Cloud Run
import { handler } from './dist/server/entry.mjs';
import http from 'http';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get port from environment variable or use 8080 as fallback (Cloud Run default)
const PORT = process.env.PORT || 8080;

// Create server
const server = http.createServer((req, res) => {
  handler(req, res);
});

// Start listening
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
