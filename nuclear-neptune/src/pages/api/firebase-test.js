// Firebase API test endpoint
import { getApps, getApp, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const prerender = false;

export async function GET() {
  try {
    console.log("[DEBUG] Starting /api/firebase-test endpoint");
    
    // Initialize Firebase Admin if not already initialized
    let firebaseAdmin;
    if (getApps().length === 0) {
      console.log("[DEBUG] Initializing Firebase Admin");
      // When running in Cloud Run, use default credentials
      if (process.env.K_SERVICE) {
        firebaseAdmin = initializeApp();
      } else {
        // For local development, use service account if available
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
          ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
          : null;
          
        if (serviceAccount) {
          firebaseAdmin = initializeApp({
            credential: cert(serviceAccount)
          });
        } else {
          return new Response(
            JSON.stringify({ 
              error: "Firebase service account not found. Set FIREBASE_SERVICE_ACCOUNT environment variable for local development." 
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    } else {
      firebaseAdmin = getApp();
    }
    
    // Get Firestore instance
    const db = getFirestore();
    
    // Fetch some data from Firestore
    const itemsRef = db.collection('items');
    const snapshot = await itemsRef.limit(10).get();
    
    const items = [];
    snapshot.forEach(doc => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`[DEBUG] Fetched ${items.length} items from Firestore`);
    
    // Return the data
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Firebase connection successful",
        items,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error('[ERROR] /api/firebase-test:', e);
    return new Response(
      JSON.stringify({ error: e.message || "Failed to connect to Firebase." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
