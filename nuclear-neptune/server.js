// server.js - Entry point for Cloud Run and Firebase Hosting
import { handler } from './dist/server/entry.mjs';
import http from 'http';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK for server-side operations
// In Cloud Run, we can use the default credentials
let firebaseAdmin;
try {
  // When running in Cloud Run, use default credentials
  if (process.env.K_SERVICE) {
    firebaseAdmin = initializeApp();
    console.log('Initialized Firebase Admin with default credentials');
  } else {
    // For local development, use service account
    // You'll need to have a service account JSON file for local development
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;
      
    if (serviceAccount) {
      firebaseAdmin = initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('Initialized Firebase Admin with service account');
    } else {
      console.warn('No Firebase service account found, skipping Firebase Admin initialization');
    }
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

// Get port from environment variable or use 8080 as fallback (Cloud Run default)
const PORT = parseInt(process.env.PORT || '8080', 10);

// Create server
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  // Add CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  try {
    handler(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }
});

// Start listening
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  }
});
