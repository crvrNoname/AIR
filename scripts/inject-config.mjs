// scripts/inject-config.mjs
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─────────────────────────────────────────────────────────────
// CLI helpers
// ─────────────────────────────────────────────────────────────
const ARGS = process.argv.slice(2);
const hasFlag = (f) => ARGS.includes(f);
const getVal = (k, def = null) => {
  // admite --key=value o --key value
  const byEq = ARGS.find(a => a.startsWith(`${k}=`));
  if (byEq) return byEq.split('=').slice(1).join('='); // por si el valor contiene '='
  const idx = ARGS.indexOf(k);
  if (idx !== -1 && idx + 1 < ARGS.length && !ARGS[idx + 1].startsWith('--')) return ARGS[idx + 1];
  return def;
};
const getList = (k) => {
  const v = getVal(k);
  if (!v) return null;
  return v.split(',').map(s => s.trim()).filter(Boolean);
};

// flags
const WANT_INIT = hasFlag('--init');
const DRY = hasFlag('--dry');
const VERBOSE = hasFlag('--verbose');
const MAKE_BAK = hasFlag('--bak');
const ONLY_KEYS = getList('--only'); // ej: --only=NOMBRE_MARCA,EMAIL
const DOCS_DIR = path.resolve(ROOT, getVal('--docs', 'docs'));
const EXT_LIST = (getList('--ext') || ['.html', '.js']).map(e => e.startsWith('.') ? e : `.${e}`);

// ─────────────────────────────────────────────────────────────
// Defaults / example config
// ─────────────────────────────────────────────────────────────
const DEFAULT_EXAMPLE = {
  "NOMBRE_MARCA": "Mi Taller",
  "DESCRIPCION_CORTA": "Mecánica y electrónica automotriz.",
  "PHONE_VISIBLE": "+56 9 XXXXXXXX",
  "WHATSAPP_E164": "+56912345678",
  "EMAIL": "correo@dominio.cl",
  "DIRECCION_COMPLETA": "Av. Ejemplo 123, Santiago, Chile",
  "GOOGLE_MAPS_URL": "https://maps.google.com/?q=Av.+Ejemplo+123",
  "GOOGLE_MAPS_IFRAME_SRC": "https://www.google.com/maps/embed?pb=...",
  "HORARIO_ATENCION": "L–V 09:00–18:00, S 09:00–14:00",
  "INSTAGRAM_URL": "https://instagram.com/tu_cuenta",
  "FACEBOOK_URL": "https://facebook.com/tu_cuenta",
  "PALETA_HEX": "#2dd4bf,#60a5fa,#f59e0b"
};

async function ensureExampleConfig() {
  const examplePath = path.join(ROOT, 'config.example.json');
  try {
    await fs.access(examplePath);
  } catch {
    await fs.writeFile(examplePath, JSON.stringify(DEFAULT_EXAMPLE, null, 2), 'utf8');
    console.log('✔️  Creado config.example.json con valores de muestra');
  }
}

async function ensureConfig() {
  const cfgPath = path.join(ROOT, 'config.json');
  try {
    await fs.access(cfgPath);
    return cfgPath;
  } catch {
    await ensureExampleConfig();
    const examplePath = path.join(ROOT, 'config.example.json');
    const data = await fs.readFile(examplePath, 'utf8');
    await fs.writeFile(cfgPath, data, 'utf8');
    console.log('✔️  Creado config.json a partir de config.example.json');
    return cfgPath;
  }
}

async function readConfig() {
  const cfgPath = await ensureConfig();
  const raw = await fs.readFile(cfgPath, 'utf8');
  let json = {};
  try {
    json = JSON.parse(raw);
  } catch (e) {
    console.error('❌ config.json inválido (JSON).', e.message);
    process.exit(1);
  }
  // Overrides por variables de entorno (opcional)
  for (const k of Object.keys(json)) {
    if (process.env[k]) json[k] = process.env[k];
  }
  return json;
}

async function* walk(dir) {
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

// ─────────────────────────────────────────────────────────────
// Reemplazos
// ─────────────────────────────────────────────────────────────
function buildReplacers(cfg) {
  // Si --only=... está presente, limitar a esas claves
  const baseKeys = [
    'NOMBRE_MARCA', 'DESCRIPCION_CORTA', 'EMAIL', 'DIRECCION_COMPLETA',
    'GOOGLE_MAPS_URL', 'GOOGLE_MAPS_IFRAME_SRC', 'INSTAGRAM_URL', 'FACEBOOK_URL',
    'WHATSAPP_E164', 'HORARIO_ATENCION', 'PALETA_HEX', 'PHONE_VISIBLE'
  ];
  const keys = ONLY_KEYS ? baseKeys.filter(k => ONLY_KEYS.includes(k)) : baseKeys;

  const reps = [];
  for (const key of keys) {
    const val = cfg[key];
    if (typeof val === 'string') {
      reps.push({ pattern: new RegExp(String.raw`\{\{${key}\}\}`, 'g'), value: val, key });
    }
  }

  // Placeholders “visibles” del template original
  if (!ONLY_KEYS || ONLY_KEYS.includes('PHONE_VISIBLE')) {
    if (cfg.PHONE_VISIBLE) {
      reps.push({ pattern: /\{\{\+56 9 XXXXXXXX\}\}/g, value: cfg.PHONE_VISIBLE, key: 'PHONE_VISIBLE(mask)' });
    }
  }
  if (!ONLY_KEYS || ONLY_KEYS.includes('HORARIO_ATENCION')) {
    if (cfg.HORARIO_ATENCION) {
      reps.push({ pattern: /\{\{L–V 09:00–18:00, S 09:00–14:00\}\}/g, value: cfg.HORARIO_ATENCION, key: 'HORARIO_ATENCION(mask)' });
    }
  }

  return reps;
}

function replaceWithCount(content, pattern, value) {
  let hits = 0;
  const out = content.replace(pattern, () => { hits++; return value; });
  return { out, hits };
}

function shouldProcessFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (!EXT_LIST.includes(ext)) return false;
  // Para JS, solo los públicos de docs/assets/js
  if (ext === '.js') {
    const frag = path.join('docs', 'assets', 'js');
    return file.toLowerCase().includes(frag.replace(/\\/g, path.sep));
  }
  return true; // html
}

async function injectPlaceholders(cfg) {
  const targets = [];
  for await (const f of walk(DOCS_DIR)) {
    if (shouldProcessFile(f)) targets.push(f);
  }
  if (targets.length === 0) {
    console.log(`ℹ️  No se encontraron archivos en ${DOCS_DIR} con extensiones ${EXT_LIST.join(', ')}.`);
    console.log('    ¿Ejecutaste el build/copia de archivos a docs/?');
    return;
  }

  const replacers = buildReplacers(cfg);
  if (replacers.length === 0) {
    console.log('ℹ️  No hay claves para reemplazar (revisa --only o config.json).');
    return;
  }

  let filesTouched = 0;
  let totalHits = 0;

  for (const file of targets) {
    const src = await fs.readFile(file, 'utf8');
    let out = src;
    let hitsThisFile = 0;

    for (const { pattern, value, key } of replacers) {
      const res = replaceWithCount(out, pattern, value);
      if (res.hits > 0 && VERBOSE) {
        console.log(`   → ${path.relative(ROOT, file)} [${key}]: ${res.hits} reemplazo(s)`);
      }
      out = res.out;
      hitsThisFile += res.hits;
    }

    if (hitsThisFile > 0) {
      if (MAKE_BAK && !DRY) {
        try { await fs.writeFile(`${file}.bak`, src, 'utf8'); } catch {}
      }
      if (!DRY) {
        await fs.writeFile(file, out, 'utf8');
      }
      filesTouched++;
      totalHits += hitsThisFile;
    }
  }

  const mode = DRY ? 'SIMULACIÓN' : 'Inyección';
  console.log(`✔️  ${mode} completada: ${filesTouched} archivo(s) actualizados, ${totalHits} reemplazo(s).`);
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
async function main() {
  if (WANT_INIT) {
    await ensureExampleConfig();
    await ensureConfig();
    return;
  }

  const cfg = await readConfig();

  // Validación mínima
  if (!cfg.NOMBRE_MARCA) console.warn('⚠️  Falta NOMBRE_MARCA en config.json');
  if (!cfg.WHATSAPP_E164) console.warn('⚠️  Falta WHATSAPP_E164 en config.json (enlaces wa.me)');
  if (!cfg.PHONE_VISIBLE) console.warn('⚠️  Falta PHONE_VISIBLE en config.json (teléfono visible)');

  if (VERBOSE) {
    console.log(`— Carpeta docs: ${DOCS_DIR}`);
    console.log(`— Extensiones: ${EXT_LIST.join(', ')}`);
    if (ONLY_KEYS) console.log(`— Solo claves: ${ONLY_KEYS.join(', ')}`);
    if (DRY) console.log('— Modo: DRY RUN (no se escriben archivos)');
    if (MAKE_BAK) console.log('— Copias .bak activadas');
  }

  await injectPlaceholders(cfg);
}

main().catch(err => {
  console.error('❌ Error en inject-config:', err);
  process.exit(1);
});
