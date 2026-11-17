/* Assistant du site CliniQ Pro : bulle « Une question sur CliniQ Pro ? » (FR/EN).
   Les questions ne sont ni gardées ni journalisées ; la discussion reste dans cette page. */
(function () {
  if (window.__aideCliniq) return; window.__aideCliniq = 1;
  var en = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var T = en ? {
    bulle: 'A question about CliniQ Pro?', titre: 'Questions about CliniQ Pro', fermer: 'Close',
    accueil: 'Hello! Ask me about pricing, the free trial, features or your profession.',
    note: 'Please do not write any patient information here.',
    champ: 'Your question…', envoyer: 'Send', attente: 'One moment…',
    erreur: 'The assistant is not available right now. Write to us at support@cliniqpromobile.ca.',
    ex: ['How much does it cost?', 'Is it for my profession?', 'Does it work outside Quebec?']
  } : {
    bulle: 'Une question sur CliniQ Pro ?', titre: 'Questions sur CliniQ Pro', fermer: 'Fermer',
    accueil: 'Bonjour ! Posez-moi vos questions sur les prix, l’essai gratuit, les fonctions ou votre métier.',
    note: 'N’écrivez aucun renseignement sur un patient ici.',
    champ: 'Votre question…', envoyer: 'Envoyer', attente: 'Un instant…',
    erreur: 'L’assistant n’est pas disponible pour le moment. Écrivez-nous à soutien@cliniqpromobile.ca.',
    ex: ['Combien ça coûte ?', 'Est-ce pour mon métier ?', 'Ça marche hors du Québec ?']
  };
  var URL = 'https://anzgkxmxkcetzbtjttuh.supabase.co/functions/v1/aide-site';
  var CLE = 'sb_publishable_18AM9kOIPqqjI1CZz9gqow_Z89LAGnW';
  var hist = [], occupe = false;

  var css = document.createElement('style');
  css.textContent =
    '#aq-b{position:fixed;right:16px;bottom:16px;z-index:50;background:#0E5E5C;color:#fff;border:0;border-radius:999px;padding:13px 18px;font:700 15px/1.2 "Plus Jakarta Sans",system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.18);cursor:pointer;min-height:48px}' +
    '#aq-b:focus-visible,#aq-p button:focus-visible,#aq-p textarea:focus-visible{outline:3px solid #F39C12;outline-offset:2px}' +
    '#aq-p{position:fixed;right:16px;bottom:16px;z-index:51;width:min(380px,calc(100vw - 32px));height:min(540px,calc(100vh - 32px));background:#FBF9F6;border:1px solid #DCE8E5;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.22);display:none;flex-direction:column;overflow:hidden;font:16px/1.5 "Plus Jakarta Sans",system-ui,sans-serif;color:#15302F}' +
    '#aq-p.o{display:flex}#aq-h{display:flex;align-items:center;gap:8px;background:#0E5E5C;color:#fff;padding:12px 14px;font-weight:700}' +
    '#aq-h button{margin-left:auto;background:transparent;border:0;color:#fff;font-size:24px;line-height:1;cursor:pointer;min-width:40px;min-height:40px}' +
    '#aq-m{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}' +
    '.aq-r{align-self:flex-start;background:#fff;border:1px solid #DCE8E5;border-radius:14px 14px 14px 4px;padding:9px 12px;max-width:88%;white-space:pre-line}' +
    '.aq-q{align-self:flex-end;background:#0E5E5C;color:#fff;border-radius:14px 14px 4px 14px;padding:9px 12px;max-width:88%;white-space:pre-line}' +
    '.aq-n{font-size:13px;color:#56666A}.aq-ex{display:flex;flex-wrap:wrap;gap:6px}' +
    '.aq-ex button{background:#fff;border:1.5px solid #0E5E5C;color:#0E5E5C;border-radius:999px;padding:6px 12px;font-weight:600;font-size:14px;font-family:inherit;cursor:pointer;min-height:36px}' +
    '#aq-f{display:flex;gap:8px;padding:10px;border-top:1px solid #DCE8E5;background:#fff}' +
    '#aq-f textarea{flex:1;resize:none;border:1px solid #DCE8E5;border-radius:12px;padding:9px 10px;font-size:16px;line-height:1.4;font-family:inherit;height:44px;color:#15302F}' +
    '#aq-f button{background:#0E5E5C;color:#fff;border:0;border-radius:12px;padding:0 14px;font-weight:700;font-size:15px;font-family:inherit;cursor:pointer;min-height:44px}' +
    '#aq-p a{color:#0E5E5C;font-weight:700}' +
    '@media print{#aq-b,#aq-p{display:none!important}}';
  document.head.appendChild(css);

  var b = document.createElement('button');
  b.id = 'aq-b'; b.type = 'button'; b.textContent = '💬 ' + T.bulle; b.setAttribute('aria-haspopup', 'dialog');
  var p = document.createElement('div');
  p.id = 'aq-p'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', T.titre);
  p.innerHTML = '<div id="aq-h"><span>' + T.titre + '</span><button type="button" aria-label="' + T.fermer + '">×</button></div>' +
    '<div id="aq-m" aria-live="polite"></div>' +
    '<form id="aq-f"><textarea maxlength="500" placeholder="' + T.champ + '" aria-label="' + T.champ + '"></textarea><button type="submit">' + T.envoyer + '</button></form>';
  document.body.appendChild(b); document.body.appendChild(p);
  var m = p.querySelector('#aq-m'), f = p.querySelector('#aq-f'), ta = f.querySelector('textarea');

  function lienifier(el, texte) {
    var re = /([a-z0-9._-]+@cliniqpromobile\.ca|https?:\/\/[^\s)]+)/gi, i = 0, r;
    while ((r = re.exec(texte))) {
      el.appendChild(document.createTextNode(texte.slice(i, r.index)));
      var a = document.createElement('a'); var v = r[0].replace(/[.,;:]$/, '');
      a.href = v.indexOf('@') > 0 ? 'mailto:' + v : v; a.textContent = v;
      if (v.indexOf('@') < 0) { a.target = '_blank'; a.rel = 'noopener'; }
      el.appendChild(a); i = r.index + v.length; re.lastIndex = i;
    }
    el.appendChild(document.createTextNode(texte.slice(i)));
  }
  function bulle(cls, texte) {
    var d = document.createElement('div'); d.className = cls; lienifier(d, texte);
    m.appendChild(d); m.scrollTop = m.scrollHeight; return d;
  }
  function demarrer() {
    if (m.childNodes.length) return;
    bulle('aq-r', T.accueil);
    var n = document.createElement('div'); n.className = 'aq-n'; n.textContent = T.note; m.appendChild(n);
    var ex = document.createElement('div'); ex.className = 'aq-ex';
    T.ex.forEach(function (q) {
      var e = document.createElement('button'); e.type = 'button'; e.textContent = q;
      e.onclick = function () { ex.remove(); poser(q); }; ex.appendChild(e);
    });
    m.appendChild(ex);
  }
  function poser(q) {
    q = (q || '').trim(); if (q.length < 2 || occupe) return;
    occupe = true; bulle('aq-q', q); var att = bulle('aq-r aq-n', T.attente);
    fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': CLE },
      body: JSON.stringify({ question: q, historique: hist.slice(-8), langue: en ? 'en' : 'fr' })
    }).then(function (r) { return r.json(); }).then(function (d) {
      att.remove(); var rep = d.reponse || d.message || T.erreur; bulle('aq-r', rep);
      hist.push({ role: 'user', texte: q }, { role: 'assistant', texte: rep });
    }).catch(function () { att.remove(); bulle('aq-r', T.erreur); })
      .then(function () { occupe = false; });
  }
  function ouvrir() { p.classList.add('o'); b.style.display = 'none'; demarrer(); ta.focus(); }
  function fermer() { p.classList.remove('o'); b.style.display = ''; b.focus(); }
  b.onclick = ouvrir;
  p.querySelector('#aq-h button').onclick = fermer;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && p.classList.contains('o')) fermer(); });
  f.onsubmit = function (e) { e.preventDefault(); var q = ta.value; ta.value = ''; poser(q); };
  ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); f.onsubmit(e); } });
})();
