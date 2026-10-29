// In-page editor, added to every page by _editor/server.js. Its UI lives in a shadow root so the
// site's CSS and the editor's CSS never touch, and nothing it adds is written back on save.

const host = document.createElement('div');
host.setAttribute('data-editor', '');
host.contentEditable = 'false';
document.body.append(host);
const ui = host.attachShadow({ mode: 'open' });

const pageFile = location.pathname.endsWith('/') ? location.pathname + 'index.html' : location.pathname;
const sheetLinks = [...document.querySelectorAll('link[rel="stylesheet"]:not([data-editor])')].filter(
  (l) => new URL(l.href).origin === location.origin,
);

ui.innerHTML = `
<style>
  :host { all: initial; }
  * { box-sizing: border-box; font: 13px/1.4 system-ui, -apple-system, sans-serif; }
  .bar {
    position: fixed; z-index: 2147483646; left: 50%; bottom: 16px; transform: translateX(-50%);
    display: flex; align-items: center; gap: 6px; padding: 6px;
    background: #111827; color: #f9fafb; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.35);
  }
  button {
    border: 0; border-radius: 8px; padding: 7px 12px; cursor: pointer;
    background: #1f2937; color: #f9fafb; font-weight: 600;
  }
  button:hover { background: #374151; }
  button.on { background: #2563eb; }
  button.save { background: #16a34a; }
  button.save:disabled { background: #1f2937; color: #6b7280; cursor: default; }
  .status { padding: 0 8px; color: #9ca3af; white-space: nowrap; }
  .status.dirty { color: #fbbf24; }
  .panel {
    position: fixed; z-index: 2147483645; top: 0; right: 0; bottom: 0; width: min(460px, 100vw);
    display: none; flex-direction: column; gap: 10px; padding: 14px 14px 76px;
    background: #0b1220; color: #e5e7eb; box-shadow: -8px 0 30px rgba(0,0,0,.35);
  }
  .panel.open { display: flex; }
  .panel h2 { margin: 0; font-size: 14px; font-weight: 700; }
  label { display: flex; flex-direction: column; gap: 4px; color: #9ca3af; }
  input, textarea {
    width: 100%; border: 1px solid #1f2937; border-radius: 8px; padding: 7px 9px;
    background: #111827; color: #f9fafb; outline: none;
  }
  input:focus, textarea:focus { border-color: #2563eb; }
  textarea { flex: 1; resize: none; font: 12px/1.5 ui-monospace, Menlo, monospace; tab-size: 2; white-space: pre; }
  .hint { color: #6b7280; font-size: 12px; margin: 0; }
  .chip {
    position: absolute; z-index: 2147483644; display: none; align-items: center; gap: 2px; padding: 3px;
    background: #2563eb; color: #fff; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,.3);
  }
  .chip.show { display: flex; }
  .chip span { padding: 0 6px; font: 600 11px ui-monospace, Menlo, monospace; }
  .chip button { padding: 3px 7px; background: transparent; font-size: 12px; }
  .chip button:hover { background: rgba(255,255,255,.2); }
  .chip input { width: 260px; padding: 3px 7px; background: #fff; color: #111; border: 0; }
  .outline { position: absolute; z-index: 2147483643; pointer-events: none; border: 2px dashed #2563eb; border-radius: 4px; display: none; }
  .toast {
    position: fixed; z-index: 2147483647; left: 50%; bottom: 72px; transform: translateX(-50%);
    padding: 8px 14px; border-radius: 8px; background: #111827; color: #f9fafb; opacity: 0; transition: opacity .2s;
  }
  .toast.show { opacity: 1; }
  .help { position: fixed; z-index: 2147483646; left: 50%; bottom: 72px; transform: translateX(-50%); width: min(520px, 92vw);
    padding: 14px 16px; border-radius: 12px; background: #111827; color: #e5e7eb; display: none; box-shadow: 0 8px 30px rgba(0,0,0,.35); }
  .help.show { display: block; }
  .help b { color: #fff; }
  .help ul { margin: 6px 0 0; padding-left: 18px; }
  .help li { margin: 4px 0; }
</style>
<div class="outline"></div>
<div class="chip block-chip"><span class="tag"></span>
  <button data-act="up" title="Move up">↑</button><button data-act="down" title="Move down">↓</button>
  <button data-act="dup" title="Duplicate">Duplicate</button><button data-act="del" title="Delete">Delete</button>
  <button data-act="parent" title="Select the element around this one">Bigger</button>
</div>
<div class="chip link-chip"><span class="kind">Link</span><input class="url" spellcheck="false"><button data-act="close">Done</button></div>
<div class="panel">
  <h2>Page</h2>
  <label>Title (browser tab)<input class="title"></label>
  <label>Description (search results)<input class="desc"></label>
  <h2>CSS <span class="hint sheet-name"></span></h2>
  <textarea class="css" spellcheck="false"></textarea>
  <p class="hint">Changes show as you type. The site uses one stylesheet for every page.</p>
</div>
<div class="help">
  <b>Editing this page</b>
  <ul>
    <li><b>Edit text</b>: click any text and type. Enter makes a new paragraph.</li>
    <li>Click a link or image to change its address. The blue tag on the selected block can move, duplicate (e.g. a project card) or delete it; <b>Bigger</b> selects the element around it.</li>
    <li><b>CSS</b>: page title, description and the stylesheet, live.</li>
    <li><b>Save</b> (or Cmd+S) writes to the real files. Git keeps the old version if you need it back.</li>
    <li>Links work as normal when Edit text is off, so you can move between pages.</li>
  </ul>
</div>
<div class="bar">
  <button class="edit">Edit text</button>
  <button class="cssbtn">CSS</button>
  <button class="save" disabled>Save</button>
  <span class="status">No changes</span>
  <button class="helpbtn" title="How this works">?</button>
</div>
<div class="toast"></div>`;

const $ = (sel) => ui.querySelector(sel);
const el = {
  edit: $('.edit'), cssBtn: $('.cssbtn'), save: $('.save'), status: $('.status'), helpBtn: $('.helpbtn'),
  panel: $('.panel'), title: $('.title'), desc: $('.desc'), css: $('.css'), sheetName: $('.sheet-name'),
  help: $('.help'), toast: $('.toast'), outline: $('.outline'),
  blockChip: $('.block-chip'), tag: $('.tag'), linkChip: $('.link-chip'), kind: $('.kind'), url: $('.url'),
};

const state = { editing: false, htmlDirty: false, cssDirty: false, block: null, linkTarget: null };

// ---- Dirty tracking ----

function renderStatus() {
  const dirty = state.htmlDirty || state.cssDirty;
  el.save.disabled = !dirty;
  el.status.textContent = dirty ? 'Unsaved changes' : 'No changes';
  el.status.classList.toggle('dirty', dirty);
}

const isEditorNode = (n) => n === host || (n instanceof Node && host.contains(n));
const isEditorOnly = (n) => n instanceof Element && n.hasAttribute('data-editor');
/** Changes the editor makes for itself (edit mode, the live CSS preview) are not page edits. */
const isPageEdit = (r) => {
  if (isEditorNode(r.target)) return false;
  if (r.type === 'attributes') return !['contenteditable', 'spellcheck', 'disabled'].includes(r.attributeName);
  const owner = r.target instanceof Element ? r.target : r.target.parentElement;
  if (owner?.closest('[data-editor]')) return false;
  if (r.type === 'childList') {
    const nodes = [...r.addedNodes, ...r.removedNodes];
    return !(nodes.length && nodes.every(isEditorOnly));
  }
  return true;
};
new MutationObserver((records) => {
  if (records.some(isPageEdit)) {
    state.htmlDirty = true;
    renderStatus();
  }
}).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true });

addEventListener('beforeunload', (e) => {
  if (state.htmlDirty || state.cssDirty) e.preventDefault();
});

// ---- Text editing ----

function setEditing(on) {
  state.editing = on;
  el.edit.classList.toggle('on', on);
  el.edit.textContent = on ? 'Editing (Esc to stop)' : 'Edit text';
  document.body.contentEditable = on ? 'true' : 'inherit';
  if (!on) document.body.removeAttribute('contenteditable');
  document.body.spellcheck = on;
  if (!on) document.body.removeAttribute('spellcheck');
  document.execCommand('defaultParagraphSeparator', false, 'p');
  if (!on) selectBlock(null);
}

el.edit.addEventListener('click', () => setEditing(!state.editing));

// Paste plain text only, so copied styles from other sites don't end up in the HTML.
document.addEventListener('paste', (e) => {
  if (!state.editing || isEditorNode(e.target)) return;
  e.preventDefault();
  document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
});

const BLOCKS = 'li, p, h1, h2, h3, h4, figure, section, dl, ul, blockquote, header, footer, img';

function selectBlock(node) {
  state.block = node && node !== document.body && !isEditorNode(node) ? node : null;
  placeChip();
}

function placeChip() {
  const b = state.block;
  if (!b || !b.isConnected) {
    el.blockChip.classList.remove('show');
    el.outline.style.display = 'none';
    return;
  }
  const r = b.getBoundingClientRect();
  const x = r.left + scrollX;
  const y = r.top + scrollY;
  Object.assign(el.outline.style, { display: 'block', left: `${x - 4}px`, top: `${y - 4}px`, width: `${r.width + 8}px`, height: `${r.height + 8}px` });
  el.tag.textContent = b.tagName.toLowerCase() + (b.classList.length ? '.' + [...b.classList].join('.') : '');
  el.blockChip.classList.add('show');
  Object.assign(el.blockChip.style, { left: `${x - 4}px`, top: `${Math.max(scrollY, y - 34)}px` });
}
addEventListener('scroll', placeChip, { passive: true });
addEventListener('resize', placeChip);

el.blockChip.addEventListener('click', (e) => {
  const act = e.target.closest('button')?.dataset.act;
  const b = state.block;
  if (!act || !b) return;
  if (act === 'up' && b.previousElementSibling) b.previousElementSibling.before(b);
  if (act === 'down' && b.nextElementSibling) b.nextElementSibling.after(b);
  if (act === 'dup') {
    const copy = b.cloneNode(true);
    // Keep the source's line breaks and indentation between the two.
    const gap = b.previousSibling?.nodeType === Node.TEXT_NODE ? b.previousSibling.textContent : '\n';
    b.after(document.createTextNode(gap), copy);
    selectBlock(copy);
    return;
  }
  if (act === 'del') {
    const next = b.nextElementSibling || b.previousElementSibling || b.parentElement;
    if (b.previousSibling?.nodeType === Node.TEXT_NODE && !b.previousSibling.textContent.trim()) b.previousSibling.remove();
    b.remove();
    selectBlock(next);
    return;
  }
  if (act === 'parent') return selectBlock(b.parentElement?.closest(BLOCKS) || b.parentElement);
  placeChip();
});

// ---- Links and images ----

function openLinkChip(target) {
  state.linkTarget = target;
  const isImg = target.tagName === 'IMG';
  el.kind.textContent = isImg ? 'Image' : 'Link';
  el.url.value = target.getAttribute(isImg ? 'src' : 'href') || '';
  const r = target.getBoundingClientRect();
  Object.assign(el.linkChip.style, { left: `${r.left + scrollX}px`, top: `${r.bottom + scrollY + 6}px` });
  el.linkChip.classList.add('show');
}
function closeLinkChip() {
  el.linkChip.classList.remove('show');
  state.linkTarget = null;
}
el.url.addEventListener('input', () => {
  const t = state.linkTarget;
  if (t) t.setAttribute(t.tagName === 'IMG' ? 'src' : 'href', el.url.value);
});
el.url.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === 'Escape') closeLinkChip();
});
el.linkChip.addEventListener('click', (e) => {
  if (e.target.closest('button')?.dataset.act === 'close') closeLinkChip();
});

document.addEventListener(
  'click',
  (e) => {
    if (!state.editing || isEditorNode(e.target)) return;
    const link = e.target.closest('a');
    if (link) e.preventDefault(); // edit it, don't follow it
    const img = e.target.closest('img');
    if (link || img) openLinkChip(img || link);
    else closeLinkChip();
    selectBlock(e.target.closest(BLOCKS));
  },
  true,
);

document.addEventListener('keyup', () => {
  if (!state.editing) return;
  const n = getSelection()?.anchorNode;
  const node = n?.nodeType === Node.TEXT_NODE ? n.parentElement : n;
  if (node instanceof Element) selectBlock(node.closest(BLOCKS));
});

// ---- Page fields and CSS ----

const metaDesc = document.querySelector('meta[name="description"]');
el.title.value = document.title;
el.desc.value = metaDesc?.getAttribute('content') || '';
el.desc.disabled = !metaDesc;
el.title.addEventListener('input', () => (document.title = el.title.value));
el.desc.addEventListener('input', () => metaDesc?.setAttribute('content', el.desc.value));

const sheet = sheetLinks[0] ? { link: sheetLinks[0], file: new URL(sheetLinks[0].href).pathname, original: '' } : null;
let liveStyle = null;
if (sheet) {
  el.sheetName.textContent = sheet.file;
  fetch(sheet.file, { cache: 'no-store' })
    .then((r) => r.text())
    .then((text) => {
      sheet.original = text;
      el.css.value = text;
    });
} else {
  el.css.value = '/* This page has no stylesheet of its own. */';
  el.css.disabled = true;
}

el.css.addEventListener('input', () => {
  if (!sheet) return;
  if (!liveStyle) {
    liveStyle = document.createElement('style');
    liveStyle.setAttribute('data-editor', '');
    sheet.link.after(liveStyle);
    sheet.link.disabled = true;
  }
  liveStyle.textContent = el.css.value;
  state.cssDirty = el.css.value !== sheet.original;
  renderStatus();
});
el.css.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  document.execCommand('insertText', false, '  ');
});

el.cssBtn.addEventListener('click', () => {
  const open = !el.panel.classList.contains('open');
  el.panel.classList.toggle('open', open);
  el.cssBtn.classList.toggle('on', open);
});
el.helpBtn.addEventListener('click', () => el.help.classList.toggle('show'));

// ---- Save ----

/** The page as it should be on disk: no editor UI, no editing attributes. */
function pageSource() {
  const doc = document.documentElement.cloneNode(true);
  doc.querySelectorAll('[data-editor]').forEach((n) => n.remove());
  doc.querySelectorAll('[contenteditable], [spellcheck]').forEach((n) => {
    n.removeAttribute('contenteditable');
    n.removeAttribute('spellcheck');
  });
  doc.querySelectorAll('link[disabled]').forEach((n) => n.removeAttribute('disabled'));
  return '<!doctype html>\n' + doc.outerHTML + '\n';
}

async function post(file, content) {
  const res = await fetch('/_editor/save', { method: 'POST', body: JSON.stringify({ file, content }) });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
}

let toastTimer;
function toast(text) {
  el.toast.textContent = text;
  el.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('show'), 2500);
}

async function save() {
  if (!state.htmlDirty && !state.cssDirty) return;
  const saved = [];
  try {
    if (state.htmlDirty) {
      await post(pageFile, pageSource());
      state.htmlDirty = false;
      saved.push(pageFile.slice(1));
    }
    if (state.cssDirty && sheet) {
      await post(sheet.file, el.css.value);
      sheet.original = el.css.value;
      state.cssDirty = false;
      saved.push(sheet.file.slice(1));
    }
    toast(`Saved ${saved.join(' and ')}`);
  } catch (err) {
    toast(`Couldn't save: ${err.message}`);
  }
  renderStatus();
}

el.save.addEventListener('click', save);
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    save();
  }
  if (e.key === 'Escape' && state.editing && !isEditorNode(e.target)) setEditing(false);
});

renderStatus();
