import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "./env.js";

const app =
  getApps()[0] ??
  initializeApp({
    credential: applicationDefault(),
    ...(env.FIREBASE_PROJECT_ID ? { projectId: env.FIREBASE_PROJECT_ID } : {}),
    ...(env.FIREBASE_STORAGE_BUCKET ? { storageBucket: env.FIREBASE_STORAGE_BUCKET } : {})
  });

export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
