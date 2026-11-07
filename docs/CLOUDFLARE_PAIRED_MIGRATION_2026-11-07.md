# CHEQ App + CHEQ Digital paired Cloudflare migration

Status: **paired testing deployed; production cutover blocked by credentials and external DNS.**

## Sources and destinations

| Service | Base source | Cloudflare Worker |
| --- | --- | --- |
| CHEQ App | himanshustill777-crypto/Cheq @ 8aa3425a3e1ba05cb522b9909a85cb34b82ef67e | cheq-app-preview |
| CHEQ Digital | himanshustill777-crypto/CHeeQ-Medical @ c5d686f4a3d056ee1b704b97de040c4f2c1b90f5 | cheq-digital-preview |

Both Workers are in the same existing Cloudflare account. Digital's server-side service binding calls CHEQ App directly, without depending on Vercel. Public tracking uses a same-origin Digital API that forwards only reference and email; it never forwards Admin credentials or internal actions.

Testing URLs:

- https://cheq-app-preview.imuthoot-preview-766c63.workers.dev/
- https://cheq-digital-preview.imuthoot-preview-766c63.workers.dev/

## Implementation

- CHEQ's original 52 CommonJS APIs run through a Request/Response adapter. Existing API business logic, sessions, ownership checks and financial restrictions are retained.
- PostgreSQL pools are scoped to each Worker request and closed afterwards. The bundle selects the `workerd` PostgreSQL socket implementation.
- Existing R2 artwork is accessed through a native bucket binding. The adapter refuses R2 writes unless migration mode is `production`, protecting existing artwork during testing. No S3 access keys are needed on Workers.
- Original root HTML and assets are bundled using an explicit public-file allowlist. API source, documents, repository metadata and secrets are not served as static assets.
- Digital retains its Next.js pages and styling, exported to static assets. The three existing server routes are moved under `cloudflare/api`, with their backend calls adapted to the service binding.
- Digital payment routes are retained but disabled in migration testing before any provider call. No gateway credentials were activated.
- Logs and traces are enabled with query-string redaction.
- Build scripts use esbuild 0.28.2. Run `npm ci`, then `npm run build:cloudflare` for CHEQ App. For Digital run `npm ci`, `npm run build`, then `npm run build:cloudflare`.

## Data isolation

Testing branch: `br-winter-cake-b8gc3dxb` (`cheq-cloudflare-paired-testing-2026-11-07`), cloned from production `br-nameless-sound-b88n4h15` in Neon project `wild-brook-49219116`.

Both testing services share that branch. Production financial fingerprints were rechecked after deployment: wallets (6), ledger (0), holds (0), payment requests (0), history (8), withdrawals (0): **all unchanged**. No production customer financial rows were modified during migration.

Four prepared public catalog listings are visible only in the isolated testing branch. Production listings remain hidden pending a successful release. No DEMO orders, voucher stock, sample codes or test purchases were copied to production.

## Verification

| Check | Result |
| --- | --- |
| Existing automated CHEQ suite | PASS: 69 tests |
| New adapter tests: body/query/auth headers, malformed/oversized JSON, secure cookies, binary downloads, bodyless responses | PASS: 4 tests |
| Combined automated suite | PASS: 73, FAIL: 0 |
| HTTP read-only smoke checks | 24 PASS, 1 CONFIGURATION BLOCKED out of 25 |
| Admin auth GET | BLOCKED: 503 `Admin access not configured`; original Admin secret is not exportable |
| Browser CHEQ onboarding | PASS: original permission screen renders |
| Browser Digital home and tracking | PASS: styled pages render; dummy tracking lookup returns `Order not found` from shared backend |
| Wallet pricing API | PASS: 200, existing 3.5% card fee and schemaReady=true |
| R2 partners and dashboard media GET | PASS: 200 |
| Guest bypass endpoints | PASS: 410 |
| Unauthenticated session | PASS: 401 |
| Biometric GET | PASS: 405 |
| Production-mode Gift operations | PASS: 404 |
| Gift capabilities | PASS: catalogOnly=true, purchasesEnabled=false, providerConnected=false, adminEnabled=false |

The HTTP suite and test totals are recorded in `cloudflare/smoke-results.json` and `cloudflare/test-summary.json`.

Automatic approval review rejected the POST smoke suite because it included project submission and payment-order creation endpoints. It was not retried through an alternative path. A separate GET-only suite completed. Form submissions, payment POST checks and all real financial actions remain unverified. No payment success is claimed.

## Remaining blockers and manual checks

1. Add `SMTP_PASS` and `ADMIN_KEY` securely to CHEQ App's Cloudflare Worker settings. Vercel marks these as sensitive and does not return their values. Other readable SMTP settings and the shared internal payment-record key were transferred as secret bindings. Do not place passwords in source, reports or chat.
2. Test actual email OTP delivery, returning-device MPIN, new-device invalidation, logout, biometric enrollment and Admin access after credentials are configured. A new hostname requires a new browser session and biometric enrollment for that hostname.
3. Test Admin workflows, documents, banners and uploads. Preview intentionally refuses writes to live R2 artwork.
4. Verify Digital form creation and tracking with a disposable request in the isolated branch, then Admin approval. Payment checks remain deferred per the user's instruction; do not enable Digital or Gift payments merely to complete migration.
5. Inspect and preserve all mail/DNS records before changing nameservers. No domain nameserver or live routing changes have been made.
6. Switch both services together to production resources only after both are configured and tested. Do not leave Digital pointing at the isolated database while CHEQ App points to production.

## DNS preparation

Free Cloudflare zones were created and are **pending**, with no registrar nameserver change:

| Domain | Zone ID | Current external DNS |
| --- | --- | --- |
| cheqdigital.shop | 39f00eec90838940709b2d33fd9fce1c | launch1.spaceship.net / launch2.spaceship.net |
| cheqdigital.store | 67e322b64f1c6d2d37d2688d7d3d78de | ns10.trs-dns.info / ns10.trs-dns.org / ns01.trs-dns.com / ns01.trs-dns.net |

Cloudflare assigned `elly.ns.cloudflare.com` and `kellen.ns.cloudflare.com`. These are preparation details, **not instructions to switch now**. DNS discovery was triggered; review results and verify mailbox records first. The `.store` domain was already misconfigured according to Vercel's read-only DNS report.

## Rollback / resume

- Previous Vercel production deployments and source branches were retained. Vercel currently returns 402 DEPLOYMENT_DISABLED, so rolling back code alone will not restore Vercel hosting.
- Production Neon checkpoint `snap-jolly-violet-b8e3ieqx` exists from the approved release preparation; it expires 2026-11-14T18:00:00Z. Do not restore the whole database over later customer activity as a routine code rollback.
- Current Cloudflare testing deployments can be replaced without modifying production records. Retain their isolated database branch until testing is complete.
- For a later paired live cutover, record prior DNS values, Worker versions and production database target. Roll back the two routing/service targets together; do not restore financial data to roll back frontend code.

Built artifact SHA-256:

- App: c679159c0850c8b8340edc4d02ec9c30b2ef8b1f09f70d4b498d109a76c0db00
- Digital: ab57eaeaf6475ee9c7ad6c43789fd0025ea012b3301a90d2ce40c79452089a24
