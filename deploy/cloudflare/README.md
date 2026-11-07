# CHEQ Digital — Cloudflare backend routing

Target Worker: `cheq-digital-preview` (testing).
Backend: Cloudflare service binding `CHEQ_APP` → `cheq-app-preview`.
The source website is the GitHub repo `CHeeQ-Medical` used by Vercel project `cheeq-medical`. That repository currently contains **CHEQ Digital**, not a separate medical-commerce storefront.

## Verified migration on 2026-11-08
- Switched 6 legacy Vercel hostname references to the internal `https://cheq-app.internal` service route in the existing Worker.
- Preserved the three Worker bindings: `CHEQ_APP`, `CHEQ_DIGITAL_PAYMENTS_ENABLED=false`, and `CHEQ_MIGRATION_MODE=testing`.
- GET `/api/digital-orders`: returns backend validation errors as expected (400 for invalid details, 404 for unknown order).
- POST `/api/digital-order-submit` with `{}`: returns 400 "Please enter valid project details" from the CHEQ backend; no new order created.
- POST payment creation and verification: both return 503 (intentionally disabled).
- GET `/order`, `/track`, and `/__migration/health`: working.
- No production DNS switch, database mutation, or live payment performed.

## Rebuild warning
The existing deployed Worker was patched directly through the Cloudflare API. A new generated bundle may still contain legacy Vercel URLs if built from unchanged Next.js route files. Before uploading a future CHEQ Digital Worker bundle, run:

```bash
node deploy/cloudflare/rewrite-digital-worker.mjs worker.mjs worker-cloudflare.mjs
node --test tests/cloudflare-routing.test.mjs
```

Upload only `worker-cloudflare.mjs`, using Cloudflare multipart metadata with `keep_bindings` or inherited bindings. Preserve payment flags and check a safe read-only endpoint after deployment.

The transformation is fail-closed: it refuses unexpected backend reference counts or a missing service binding/payment gate. It must be revised with a fresh audit if the source bundle changes significantly.

Previous Worker version (rollback reference): `ec14416b-0800-468b-b5f7-b59fceba4625`.

Real approved-order creation, live Razorpay processing, and production DNS are **not** part of this testing migration.

## CHEQ App Admin order integration — follow-up fix
- CHEQ Digital frontend `app/track/page.js` now calls the relative same-origin `/api/digital-orders` route. This matches the already-deployed Cloudflare frontend asset and prevents future Vercel rebuilds from reintroducing the legacy tracking origin.
- CHEQ App's `api/cheq-digital-orders.js` was fixed on branch `fix/spacemail-otp-cloudflare-2026-11-08` so Admin PATCH checks order existence and account hold **before** changing data. The post-update undefined `email` reference was removed.
- Its origin checks now accept secure requests from the same Worker hostname, preserve the existing trusted CHEQ Digital domains, and reject unknown origins. The route still requires `x-admin-key` for Admin PATCH.
- On Cloudflare testing, unauthorized same-origin Admin PATCH returned **401 Admin access required** (previously 403 Origin not allowed). This test did not update an order. The full GitHub test suite passed **85 / 85**.
- The Digital Worker remained in `testing` mode; `CHEQ_DIGITAL_PAYMENTS_ENABLED=false`. Both Razorpay API endpoints returned **503** by design. No live payment or real customer order was created for verification.
- Apply both the CHEQ App backend fixes and the Digital build rewrite before any future rebuild of the two Workers. Do not automatically enable payments or switch production DNS.
