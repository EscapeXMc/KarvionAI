/* KARVION AI — optional Firebase Firestore cloud sync (REST API, free tier)
   Works out of the box with localStorage. To enable cloud sync, fill in
   CONFIG.FIREBASE.projectId + apiKey in chat.html (Firestore must be enabled). */
(function () {
  var FB = { projectId: '', apiKey: '', databaseId: '(default)' };
  var pending = {}, saving = {};
  var SAVE_DEBOUNCE = 600;
  var authError = false;

  function docURL(uid) {
    var safe = String(uid).replace(/[^a-zA-Z0-9_-]/g, '');
    return 'https://firestore.googleapis.com/v1/projects/' + FB.projectId +
      '/databases/' + FB.databaseId + '/documents/chat_' + safe + '?key=' + FB.apiKey;
  }

  function toFields(chatsObj) {
    var json = JSON.stringify(chatsObj || {});
    var fields = {};
    for (var i = 0, step = 60000; i < json.length; i += step) {
      fields['chunk' + i] = { stringValue: json.slice(i, i + step) };
    }
    return { fields: fields };
  }

  function push(uid) {
    var body = pending[uid] || {};
    pending[uid] = null;
    fetch(docURL(uid), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFields(body))
    }).then(function (res) {
      if (res.status === 401 || res.status === 403) authError = true;
    }).catch(function () {}).finally(function () {
      saving[uid] = false;
      if (authError) { pending[uid] = null; return; }
      if (pending[uid]) setTimeout(function () { push(uid); }, 50);
    });
  }

  window.FirebaseSync = {
    configure: function (c) {
      if (!c) return;
      FB.projectId = c.projectId || '';
      FB.apiKey = c.apiKey || '';
      FB.databaseId = c.databaseId || '(default)';
    },
    enabled: function () { return !!(FB.projectId && FB.apiKey) && !authError; },

    save: function (uid, chat) {
      if (!this.enabled() || !uid || !chat) return;
      var local = {};
      try { local = JSON.parse(localStorage.getItem('karvion_sync_' + uid) || 'null') || {}; } catch (e) {}
      local[chat.id] = { updatedAt: Date.now() };
      try { local[chat.id].messages = chat.messages || []; local[chat.id].title = chat.title; local[chat.id].id = chat.id; } catch (e) {}
      pending[uid] = local;
      if (saving[uid]) return;
      saving[uid] = true;
      setTimeout(function () { push(uid); }, SAVE_DEBOUNCE);
    },

    pull: function (uid) {
      if (!this.enabled() || !uid) return Promise.resolve(null);
      return fetch(docURL(uid)).then(function (res) {
        if (!res.ok) return null;
        return res.json();
      }).then(function (data) {
        var fields = (data && data.fields) || {};
        var json = '';
        Object.keys(fields).sort(function (a, b) { return a.length - b.length || a.localeCompare(b); })
          .forEach(function (k) { json += fields[k].stringValue || ''; });
        return json ? JSON.parse(json) : null;
      }).catch(function () { return null; });
    }
  };
})();
