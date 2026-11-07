import test from 'node:test';
import assert from 'node:assert/strict';
import {rewriteDigitalWorker} from '../deploy/cloudflare/rewrite-digital-worker.mjs';

const old = 'cheq-git-main-cheq-ce9ed76b.vercel.app';
const base = [
  'async function m(I,Z){',
  'let b=new URL(I);',
  'if(b.hostname==="' + old + '"){',
  'return R.CHEQ_APP.fetch(new Request("https://cheq-app.internal/api/cheq-digital-orders"));',
  '}return fetch(I,Z)}',
  'var H="https://' + old + '/api/cheq-digital-orders";',
  'let p="https://' + old + '/api/cheq-digital-orders?reference=X";',
  'let a="https://' + old + '/api/cheq-digital-orders?action=payment-event";',
  'let q="https://' + old + '/api/cheq-digital-orders?action=payment-state";',
  'let t="https://' + old + '/api/cheq-digital-orders?reference=Y";',
  'if(env.CHEQ_DIGITAL_PAYMENTS_ENABLED!=="true")return new Response("disabled",{status:503});',
  'fetch("https://api.razorpay.com/v1/orders")'
].join('');

test('rewrites only six Vercel backend occurrences to Cloudflare service binding', () => {
  const result = rewriteDigitalWorker(base);
  assert.equal(result.replacements, 6);
  assert.equal(result.source.includes(old), false);
  assert.equal(result.source.includes('b.hostname==="cheq-app.internal"'), true);
  assert.equal(result.source.includes('R.CHEQ_APP.fetch('), true);
  assert.equal(result.source.includes('https://api.razorpay.com/v1/orders'), true);
  assert.equal(result.source.includes('CHEQ_DIGITAL_PAYMENTS_ENABLED'), true);
});

test('fails closed on changed Vercel reference count', () => {
  assert.throws(() => rewriteDigitalWorker(base.replace('let t="https://' + old, 'let t="https://missing')), /Unexpected number/);
});

test('refuses to rewrite if service binding guard disappears', () => {
  assert.throws(() => rewriteDigitalWorker(base.replace('R.CHEQ_APP.fetch(', 'globalThis.fetch(')), /service binding/);
});

test('refuses to rewrite if payment safety flag disappears', () => {
  assert.throws(() => rewriteDigitalWorker(base.replace('CHEQ_DIGITAL_PAYMENTS_ENABLED', 'UNSAFE_ENABLE')), /payment disabled guard/);
});
