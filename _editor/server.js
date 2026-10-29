// Local editing server for the portfolio. Serves the site like GitHub Pages would, adds the
// editor toolbar to every page, and saves edits back to the .html and .css files.
//
//   node _editor/server.js        then edit at http://localhost:4000
//
// Only listens on this computer (127.0.0.1). Nothing here is published: GitHub Pages skips
// folders that start with an underscore.
import http from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { exec } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.env.PORT) || 4000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
};

const INJECT = '<link rel="stylesheet" href="/_editor/editor.css" data-editor>\n<script type="module" src="/_editor/editor.js" data-editor></script>\n';

/** Named entities the site's pages use, so saving keeps "&copy;" instead of "©". */
const ENTITIES = {
  nbsp: ' ', copy: '©', reg: '®', trade: '™', mdash: '—', ndash: '–', hellip: '…',
  rarr: '→', larr: '←', uarr: '↑', darr: '↓', middot: '·', bull: '•', times: '×',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', deg: '°', minus: '−', check: '✓',
};

const BARE_ATTRS = new Set([
  'crossorigin', 'hidden', 'disabled', 'async', 'defer', 'open', 'required', 'checked',
  'selected', 'novalidate', 'autofocus', 'controls', 'loop', 'muted', 'playsinline', 'download',
]);

/** A path inside the site, or null when it would escape it or touch git or the editor. */
function sitePath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    return null;
  }
  if (decoded.endsWith('/')) decoded += 'index.html';
  const full = path.resolve(ROOT, '.' + decoded);
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return null;
  if (full.split(path.sep).includes('.git')) return null;
  return full;
}

/**
 * Put back the entities the original file used and tidy what the browser's serializer changes,
 * so an unedited save leaves the file as it was.
 */
function restoreSource(original, edited) {
  let out = edited;
  const used = new Set(original.match(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi) || []);
  for (const entity of used) {
    const name = entity.slice(1, -1);
    let char = null;
    if (name[0] === '#') char = String.fromCodePoint(name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1)));
    else if (Object.hasOwn(ENTITIES, name)) char = ENTITIES[name];
    if (char) out = out.split(char).join(entity);
  }
  // Text after </body> in the source ends up inside <body>; put the ending back.
  const tail = original.match(/(\s*<\/body>\s*<\/html>\s*)$/i);
  if (tail) out = out.replace(/\s*<\/body>\s*<\/html>\s*$/i, tail[1]);
  // Everything up to <head> (doctype, <html>, the line breaks between) as the source wrote it.
  const start = original.match(/^[\s\S]*?<head[^>]*>/i);
  if (start) out = out.replace(/^[\s\S]*?<head[^>]*>/i, start[0]);
  // Bare attributes the serializer writes as name="".
  for (const [, name] of original.matchAll(/\s([a-z-]+)(?=[\s/>])(?!=)/gi)) {
    if (BARE_ATTRS.has(name.toLowerCase())) out = out.split(` ${name}=""`).join(` ${name}`);
  }
  // Raw "&" inside attribute values (font URLs) the serializer escapes as "&amp;".
  for (const [, value] of original.matchAll(/="([^"]*&(?![a-z]+;|#\d+;|#x[0-9a-f]+;)[^"]*)"/gi)) {
    out = out.split(`="${value.replace(/&/g, '&amp;')}"`).join(`="${value}"`);
  }
  return out;
}

async function save(req, res) {
  let body = '';
  for await (const chunk of req) body += chunk;
  const { file, content } = JSON.parse(body);
  const full = sitePath(file);
  const ext = full && path.extname(full);
  if (!full || !['.html', '.css'].includes(ext) || full.includes(`${path.sep}_editor${path.sep}`)) {
    throw Object.assign(new Error(`Can't save ${file}`), { status: 400 });
  }
  const original = await readFile(full, 'utf8');
  const next = ext === '.html' ? restoreSource(original, content) : content;
  if (next !== original) await writeFile(full, next);
  console.log(next === original ? `unchanged ${file}` : `saved ${file}`);
  return { ok: true, changed: next !== original };
}

async function serve(req, res) {
  const full = sitePath(req.url);
  if (!full) return send(res, 404, 'Not found');
  let info;
  try {
    info = await stat(full);
  } catch {
    return send(res, 404, 'Not found');
  }
  const file = info.isDirectory() ? path.join(full, 'index.html') : full;
  const ext = path.extname(file).toLowerCase();
  let data = await readFile(file);
  if (ext === '.html') {
    const html = data.toString('utf8');
    data = Buffer.from(/<\/body>/i.test(html) ? html.replace(/<\/body>/i, INJECT + '</body>') : html + INJECT);
  }
  res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(data);
}

function send(res, status, text) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/_editor/save') {
      const result = await save(req, res);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } else if (req.method === 'GET' || req.method === 'HEAD') {
      await serve(req, res);
    } else {
      send(res, 405, 'Method not allowed');
    }
  } catch (err) {
    console.error(err);
    res.writeHead(err.status || 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Editing ${ROOT}\nOpen ${url}  (Ctrl-C to stop)`);
  if (!process.env.NO_OPEN) exec(`open ${url}`);
});
