/* global importScripts, firebase */
importScripts("https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js");

// Inject these values during deployment. Never place service-account credentials here.
firebase.initializeApp({
  apiKey: "__FIREBASE_API_KEY__",
  authDomain: "__FIREBASE_AUTH_DOMAIN__",
  projectId: "__FIREBASE_PROJECT_ID__",
  messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__FIREBASE_APP_ID__"
});

firebase.messaging().onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification?.title ?? "EcoTrack AI", {
    body: payload.notification?.body ?? "A new climate action is ready for you.",
    icon: "/icon-192.png"
  });
});
