/* KARVION AI — Theme Engine (24 themes, site-wide sync via localStorage) */
(function () {
  var THEME_KEY = 'karvion_theme_v2';

  function hexRgb(hex) {
    var h = (hex || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return [0, 0, 0];
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(hexA, hexB, w) {
    var a = hexRgb(hexA), b = hexRgb(hexB);
    var r = Math.round(a[0] * (1 - w) + b[0] * w);
    var g = Math.round(a[1] * (1 - w) + b[1] * w);
    var bl = Math.round(a[2] * (1 - w) + b[2] * w);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  }
  function rgba(hex, a) {
    var c = hexRgb(hex);
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }
  var lighten = function (hex, w) { return mix(hex, '#FFFFFF', w); };
  var darken = function (hex, w) { return mix(hex, '#000000', w); };

  /* theme = { name, mode:'dark'|'light', bg, primary, accent, text? } */
  var THEMES = [
    { name: 'Emerald', mode: 'dark', bg: '#03120C', primary: '#34D399', accent: '#6EE7B7' },
    { name: 'Purple', mode: 'dark', bg: '#0D0716', primary: '#A78BFA', accent: '#DDD6FE' },
    { name: 'Ember', mode: 'dark', bg: '#0A0703', primary: '#FF7A1A', accent: '#F5C98E' },
    { name: 'Midnight', mode: 'dark', bg: '#060B16', primary: '#4DA3FF', accent: '#93C5FD' },
    { name: 'Emerald', mode: 'dark', bg: '#04130C', primary: '#34D399', accent: '#A7F3D0' },
    { name: 'Violet Haze', mode: 'dark', bg: '#0D0716', primary: '#A78BFA', accent: '#DDD6FE' },
    { name: 'Rosewood', mode: 'dark', bg: '#16060A', primary: '#FB7185', accent: '#FECDD3' },
    { name: 'Ocean', mode: 'dark', bg: '#05141F', primary: '#22D3EE', accent: '#A5F3FC' },
    { name: 'Royal', mode: 'dark', bg: '#0B0616', primary: '#C084FC', accent: '#E9D5FF' },
    { name: 'Forest', mode: 'dark', bg: '#07130A', primary: '#4ADE80', accent: '#BBF7D0' },
    { name: 'Cyber', mode: 'dark', bg: '#060A14', primary: '#00FFA3', accent: '#7CFFD0' },
    { name: 'Crimson', mode: 'dark', bg: '#140509', primary: '#FF5E5B', accent: '#FECACA' },
    { name: 'Amber', mode: 'dark', bg: '#140A02', primary: '#F59E0B', accent: '#FDE68A' },
    { name: 'Slate', mode: 'dark', bg: '#0A0D12', primary: '#94A3B8', accent: '#E2E8F0' },
    { name: 'Obsidian', mode: 'dark', bg: '#050505', primary: '#E2E8F0', accent: '#F8FAFC' },
    { name: 'Wine', mode: 'dark', bg: '#15070C', primary: '#F472B6', accent: '#FBCFE8' },
    { name: 'Teal', mode: 'dark', bg: '#04110F', primary: '#2DD4BF', accent: '#99F6E4' },
    { name: 'Aurora', mode: 'dark', bg: '#070D1A', primary: '#60A5FA', accent: '#BFDBFE' },
    { name: 'Sunset', mode: 'dark', bg: '#140610', primary: '#F97316', accent: '#FDBA74' },
    { name: 'Graphite', mode: 'dark', bg: '#0D0E11', primary: '#A8A29E', accent: '#E7E5E4' },
    { name: 'Paper', mode: 'light', bg: '#FAF7F2', primary: '#F97316', accent: '#9A3412', text: '#1F1B16' },
    { name: 'Pearl', mode: 'light', bg: '#F6F8FB', primary: '#3B82F6', accent: '#1E3A8A', text: '#0F172A' },
    { name: 'Mint', mode: 'light', bg: '#F0F7F2', primary: '#10B981', accent: '#065F46', text: '#111827' },
    { name: 'Blush', mode: 'light', bg: '#FDF5F4', primary: '#EC4899', accent: '#9D174D', text: '#1F1B1B' },
    { name: 'Solar', mode: 'light', bg: '#FFF9EC', primary: '#D97706', accent: '#92400E', text: '#292524' }
  ];

  function varsFor(t) {
    var light = t.mode === 'light';
    var text = t.text || (light ? '#1B1B1B' : '#F6F1E9');
    var bg2 = mix(t.bg, light ? '#000000' : '#FFFFFF', light ? 0.06 : 0.05);
    var bg3 = mix(t.bg, light ? '#000000' : '#FFFFFF', light ? 0.12 : 0.11);
    var primary = t.primary;
    var accent = t.accent;
    var gold2 = mix(accent, '#FFFFFF', 0.25);
    var violet = mix(primary, '#FFFFFF', 0.18);
    var cyan = mix(accent, '#FFFFFF', 0.35);
    var orange = mix(primary, '#FFFFFF', 0.12);
    var wood1 = mix(t.bg, primary, light ? 0.06 : 0.14);
    var wood2 = mix(t.bg, primary, light ? 0.12 : 0.26);
    var wood3 = mix(t.bg, primary, light ? 0.04 : 0.08);
    return {
      'color-scheme': light ? 'light' : 'dark',
      '--bg': t.bg, '--bg-2': bg2, '--bg-3': bg3,
      '--surface': rgba(light ? '#000000' : '#FFFFFF', light ? 0.05 : 0.04),
      '--surface-2': rgba(light ? '#000000' : '#FFFFFF', light ? 0.08 : 0.07),
      '--green': primary, '--green-dim': rgba(primary, 0.12), '--green-glow': rgba(primary, light ? 0.3 : 0.38),
      '--violet': violet, '--violet-dim': rgba(violet, 0.12),
      '--cyan': cyan, '--cyan-dim': rgba(cyan, 0.12),
      '--pink': '#FF5E5B',
      '--gold': accent, '--gold-2': gold2, '--gold-dim': rgba(accent, light ? 0.14 : 0.14),
      '--orange': orange,
      '--wood-1': wood1, '--wood-2': wood2, '--wood-3': wood3,
      '--wood-grad': 'linear-gradient(160deg, ' + wood1 + ' 0%, ' + wood2 + ' 48%, ' + wood3 + ' 100%)',
      '--wood-line': rgba(accent, light ? 0.22 : 0.16),
      '--brand-grad': 'linear-gradient(135deg, ' + darken(primary, 0.08) + ' 0%, ' + primary + ' 55%, ' + lighten(primary, 0.5) + ' 130%)',
      '--gold-grad': 'linear-gradient(120deg, ' + accent + ' 0%, ' + gold2 + ' 45%, ' + lighten(accent, 0.3) + ' 100%)',
      '--text': text,
      '--text-2': rgba(text, light ? 0.78 : 0.84),
      '--text-3': rgba(text, light ? 0.55 : 0.63),
      '--border': rgba(light ? '#000000' : '#FFFFFF', light ? 0.1 : 0.08),
      '--border-hi': rgba(primary, 0.45),
      '--sh-lux': '0 30px 70px -14px rgba(0,0,0,' + (light ? 0.25 : 0.6) + '), 0 10px 26px rgba(0,0,0,' + (light ? 0.12 : 0.35) + ')',
      '--sh-soft': '0 14px 38px -10px rgba(0,0,0,' + (light ? 0.14 : 0.45) + ')',
      '--sh-gold': '0 18px 48px -12px ' + rgba(primary, light ? 0.35 : 0.3),
      '--sh-card': '0 24px 60px rgba(0,0,0,' + (light ? 0.16 : 0.5) + '), 0 0 44px ' + rgba(primary, 0.07)
    };
  }

  function apply(name) {
    var t = THEMES.find(function (x) { return x.name.toLowerCase() === String(name).toLowerCase(); });
    if (!t) return null;
    var vars = varsFor(t);
    var root = document.documentElement;
    Object.keys(vars).forEach(function (k) {
      if (k === 'color-scheme') root.style.colorScheme = vars[k];
      else root.style.setProperty(k, vars[k]);
    });
    root.dataset.theme = t.name;
    root.dataset.mode = t.mode;
    try { localStorage.setItem(THEME_KEY, t.name); } catch (e) {}
    return t;
  }

  function current() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (stored) { var t = THEMES.find(function (x) { return x.name === stored; }); if (t) return t; }
    return THEMES[0];
  }

  function toggleMode() {
    var cur = current();
    var wantDark = cur.mode === 'light';
    var fallback = wantDark ? 'Emerald' : 'Pearl';
    var t = THEMES.find(function (x) { return (x.mode === (wantDark ? 'dark' : 'light')) && x.name !== cur.name; });
    return apply(t ? t.name : fallback);
  }

  window.KarvionThemes = { list: THEMES, apply: apply, current: current, toggleMode: toggleMode };

  /* apply on load (early — prevents flash) */
  var t = current();
  if (t.name !== THEMES[0].name) apply(t.name);

  /* live cross-tab sync */
  window.addEventListener('storage', function (e) {
    if (e.key === THEME_KEY && e.newValue) apply(e.newValue);
  });
})();
