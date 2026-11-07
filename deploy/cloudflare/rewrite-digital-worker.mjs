/**
 * CHEQ Digital Cloudflare route rewrite.
 *
 * Run this against the already bundled Cloudflare Worker JavaScript before uploading.
 * It rewrites historical Vercel API origins to the internal Cloudflare CHEQ_APP
 * service binding. This source module is not a deployed Worker by itself.
 *
 * Usage:
 *   node deploy/cloudflare/rewrite-digital-worker.mjs worker.mjs worker-cloudflare.mjs
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const OLD_HOST = 'cheq-git-main-cheq-ce9ed76b.vercel.app';
const INTERNAL_HOST = 'cheq-app.internal';
const REQUIRED_REFERENCE_COUNT = 6;

export function rewriteDigitalWorker(source) {
  if (typeof source !== 'string' || !source.length) throw Error('Worker source is required');
  const occurrences = source.split(OLD_HOST).length - 1;
  if (occurrences !== REQUIRED_REFERENCE_COUNT) {
    throw Error('Unexpected number of Vercel backend references (' + occurrences + '); verify build before changing it');
  }

  const oldGuard = 'b.hostname==="' + OLD_HOST + '"';
  const bindingCall = 'R.CHEQ_APP.fetch(';
  const guardCount = source.split(oldGuard).length - 1;
  if (guardCount !== 1 || !source.includes(bindingCall)) {
    throw Error('Cloudflare CHEQ_APP service binding guard not found; fail closed');
  }
  if (!source.includes('CHEQ_DIGITAL_PAYMENTS_ENABLED')) {
    throw Error('Digital payment disabled guard is missing; refuse to patch');
  }

  // Only historical backend hostname references change. The order logic,
  // credentials, payment checks, and existing service binding remain intact.
  const updated = source.split(OLD_HOST).join(INTERNAL_HOST);
  if (updated.includes(OLD_HOST)
      || !updated.includes('b.hostname==="' + INTERNAL_HOST + '"')
      || !updated.includes(bindingCall)
      || !updated.includes('CHEQ_DIGITAL_PAYMENTS_ENABLED')) {
    throw Error('Backend rewrite did not pass safety checks');
  }
  return {source: updated, replacements: occurrences};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , input, output] = process.argv;
  if (!input || !output || resolve(input) === resolve(output)) {
    throw Error('Pass distinct input and output Worker files');
  }
  const result = rewriteDigitalWorker(readFileSync(input, 'utf8'));
  writeFileSync(output, result.source);
  console.log('CHEQ Digital: switched ' + result.replacements
    + ' backend references to internal Cloudflare CHEQ_APP service binding');
}
