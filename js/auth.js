/* ===================================================
   KARVION AI — Firebase Auth (login.html / register.html)
   Uses Firebase compat SDK (works from file:// and hosted)
   =================================================== */
'use strict';

const FB = {
  apiKey: "AIzaSyD5LOPHtVZqLXORJYih19jUq6Z9tMdqO4E",
  authDomain: "karvionai.firebaseapp.com",
  projectId: "karvionai",
  storageBucket: "karvionai.firebasestorage.app",
  messagingSenderId: "121173479527",
  appId: "1:121173479527:web:f0e68c781d79c821e9c4c2",
};

const ERRS = {
  'auth/user-not-found':        'No account found with this email.',
  'auth/wrong-password':        'Incorrect password.',
  'auth/email-already-in-use':  'An account with this email already exists.',
  'auth/weak-password':         'Password must be at least 6 characters.',
  'auth/invalid-email':         'Please enter a valid email address.',
  'auth/too-many-requests':     'Too many attempts. Try again later.',
  'auth/popup-closed-by-user':  'Sign-in was cancelled.',
  'auth/network-request-failed':'Network error. Check your connection.',
  'auth/invalid-credential':    'Invalid email or password.',
};
const friendly = c => ERRS[c] || 'Something went wrong. Please try again.';

let auth = null, gProv = null;
try {
  firebase.initializeApp(FB);
  auth = firebase.auth();
  gProv = new firebase.auth.GoogleAuthProvider();
  gProv.setCustomParameters({ prompt: 'select_account' });
  // already logged in → go straight to chat
  auth.onAuthStateChanged(u => { if (u) location.replace('chat.html'); });
} catch (e) { console.error('Firebase init:', e); }

/* helpers */
function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'}"></i><span>${msg}</span>`;
  setTimeout(() => el.classList.remove('show'), 5200);
}
function hideAlert(id) { document.getElementById(id)?.classList.remove('show'); }
function setBtn(id, loading, orig) {
  const b = document.getElementById(id);
  if (!b) return;
  b.disabled = loading;
  b.innerHTML = loading
    ? `<i class="fa-solid fa-spinner fa-spin"></i> Please wait...`
    : orig;
}

/* ── LOGIN ──────────────────────────────────────────── */
window.doLogin = async function (e) {
  e?.preventDefault();
  hideAlert('loginAlert');
  const email = document.getElementById('email')?.value.trim();
  const pw    = document.getElementById('password')?.value;
  if (!email || !pw) { showAlert('loginAlert', 'Please fill in all fields.'); return; }
  setBtn('loginBtn', true);
  try {
    await auth.signInWithEmailAndPassword(email, pw);
    location.href = 'chat.html';
  } catch (err) {
    showAlert('loginAlert', friendly(err.code));
    setBtn('loginBtn', false, `<i class="fa-solid fa-arrow-right"></i> Sign In`);
  }
};

window.doForgot = async function () {
  const email = document.getElementById('email')?.value.trim();
  if (!email) { showAlert('loginAlert', 'Enter your email first.'); return; }
  try {
    await auth.sendPasswordResetEmail(email);
    showAlert('loginAlert', 'Reset email sent — check your inbox.', 'success');
  } catch (err) {
    showAlert('loginAlert', friendly(err.code));
  }
};

/* ── REGISTER ───────────────────────────────────────── */
window.doRegister = async function (e) {
  e?.preventDefault();
  hideAlert('regAlert');
  const name    = document.getElementById('username')?.value.trim();
  const email   = document.getElementById('email')?.value.trim();
  const pw      = document.getElementById('password')?.value;
  const pw2     = document.getElementById('password2')?.value;
  const terms   = document.getElementById('termsCheck')?.checked;
  if (!name || !email || !pw || !pw2) { showAlert('regAlert', 'Please fill in all fields.'); return; }
  if (pw !== pw2)  { showAlert('regAlert', 'Passwords do not match.'); return; }
  if (pw.length < 6) { showAlert('regAlert', 'Password must be at least 6 characters.'); return; }
  if (!terms)      { showAlert('regAlert', 'Please accept the Terms & Conditions.'); return; }
  setBtn('regBtn', true);
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, pw);
    await cred.user.updateProfile({ displayName: name });
    location.href = 'chat.html';
  } catch (err) {
    showAlert('regAlert', friendly(err.code));
    setBtn('regBtn', false, `<i class="fa-solid fa-user-plus"></i> Create Account`);
  }
};

/* ── GOOGLE ─────────────────────────────────────────── */
window.doGoogle = async function () {
  try {
    await auth.signInWithPopup(gProv);
    location.href = 'chat.html';
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user')
      toast(friendly(err.code), 'error');
  }
};

/* ── UI HELPERS ─────────────────────────────────────── */
window.togglePw = function (inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  const hidden = inp.type === 'password';
  inp.type = hidden ? 'text' : 'password';
  btn.innerHTML = `<i class="fa-solid fa-eye${hidden ? '-slash' : ''}"></i>`;
};

window.checkStrength = function (pw) {
  const bar   = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  if (!bar) return;
  let s = 0;
  if (pw.length >= 8)         s++;
  if (/[A-Z]/.test(pw))       s++;
  if (/[0-9]/.test(pw))       s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const lvl = [
    { w: '20%',  c: '#f87171', t: 'Very Weak' },
    { w: '45%',  c: '#fb923c', t: 'Weak'      },
    { w: '70%',  c: '#DDD6FE', t: 'Good'      },
    { w: '100%', c: '#A78BFA', t: 'Strong'    },
  ][Math.max(0, s - 1)];
  bar.style.width      = pw ? lvl.w : '0';
  bar.style.background = lvl.c;
  label.textContent    = pw ? lvl.t : '';
  label.style.color    = lvl.c;
};

/* enter key */
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  document.getElementById('loginBtn')?.click();
  document.getElementById('regBtn')?.click();
});
