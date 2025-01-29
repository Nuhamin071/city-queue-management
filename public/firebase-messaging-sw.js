// Use the Firebase v9 compat libraries for Service Workers
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyA2DVBbdMCDpTJr4BpuZsAerQowpRsbAF8",
  authDomain: "cityqueuemanagment.firebaseapp.com",
  projectId: "cityqueuemanagment",
  storageBucket: "cityqueuemanagment.firebasestorage.app",
  messagingSenderId: "1064382598662",
  appId: "1:1064382598662:web:a2c9901d6764cd9f673d87",
  measurementId: "G-70DM4H1DSP",
});

const messaging = firebase.messaging();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    }).catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});


messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
