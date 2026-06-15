import admin from "firebase-admin";
import { env } from "../config/env.js";

export function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp({
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET
  });
}

export function getFirestore() {
  return getFirebaseAdmin().firestore();
}

export function getStorageBucket(): any {
  const app = getFirebaseAdmin();
  return app.storage().bucket(env.FIREBASE_STORAGE_BUCKET);
}

export async function saveAuditLog(event: string, payload: Record<string, unknown>) {
  if (!env.FIREBASE_PROJECT_ID || env.NODE_ENV === "test") {
    return;
  }

  await getFirestore().collection("auditLogs").add({
    event,
    payload,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}
