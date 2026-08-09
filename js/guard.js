/* ===================================================
   KARVION AI — Auth Guard
   If a user is already signed in, send them straight
   to chat.html instead of showing any other page.
   Loads Firebase compat SDK on demand (works from file:// and hosted).
   =================================================== */
(function () {
  'use strict';
  if (window.__karvionGuard) return;
  window.__karvionGuard = true;

  const FB = {
    apiKey: "AIzaSyD5LOPHtVZqLXORJYih19jUq6Z9tMdqO4E",
    authDomain: "karvionai.firebaseapp.com",
    projectId: "karvionai",
    storageBucket: "karvionai.firebasestorage.app",
    messagingSenderId: "121173479527",
    appId: "1:121173479527:web:f0e68c781d79c821e9c4c2",
  };

  function loadScript(src) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }

  (async function guard() {
    try {
      await Promise.all([
        loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js'),
        loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js'),
      ]);
      if (typeof firebase === 'undefined' || !firebase.initializeApp) return;
      const app = firebase.initializeApp(FB);
      firebase.auth(app).onAuthStateChanged((user) => {
        if (user) location.replace('chat.html');
      });
    } catch (e) { /* stay on page if anything fails */ }
  })();
})();
