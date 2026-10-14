# Working on Klets

Read `PRODUCT.md`, `DESIGN.md` and `docs/superpowers/specs/2026-10-13-klets-design.md` before changing product behavior. The implementation plan is `docs/superpowers/plans/2026-10-13-klets-v1.md`.

- Preserve the product's short, natural Dutch voice and selected candy-like 3D identity.
- Keep the main generator to one viewport at ordinary text sizes. Large text, zoom and unusually short viewports must retain access to content.
- The category selects immediately; situation/tone editing supports confirm and cancel.
- An accepted draw reserves one result once. The animation reveals it; animation callbacks do not own the draw.
- Keep inspiration, recognition, agreements and actual partner behavior as separate concepts. Copying does not mean sending or completing.
- Do not add accounts, cloud sync, automated messaging, points or other later modules to version 1.
- Prefer small, focused changes. Run meaningful tests for the changed behavior, typecheck and build; do not repeatedly run broad checks without a new reason.
- Use one batched mobile/desktop visual inspection and one correction round when a browser is available. Report missing browser evidence accurately.
- Add no private messages, real partner photos, credentials or personal histories to this public repository.
- Commit the lockfile and deterministic assets. Do not introduce a second design system or a 3D/physics framework for a single authored object.
