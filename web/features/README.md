# Feature Structure

- `buyer/`
  - Buyer-facing workspace and chat UI.
- `merchant/`
  - Merchant-facing onboarding, auth, store picker, and dashboard UI.

The `app/` routes now act as thin wrappers so buyer and merchant frontend work can evolve independently without editing route files directly.
