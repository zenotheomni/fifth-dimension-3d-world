# Fifth Dimension – 3D Interactive App (Unity + Three.js)

**Goal:** Build a sleek, eye‑pleasing, 3D interactive “Vegas‑hotel‑style” world with compartments: **Lobby (hub)** → **Record Store**, **Arcade (4–5 games)**, **Community Board**, **Ballroom (live streams)**. On first launch, users see a **Login / Opt‑in** screen collecting email (+ optional phone) for promotions.

> Stack: **Unity (URP, WebGL)** for the 3D world + **Three.js** for lightweight web games + **React/Vite** shell. **Supabase** (Auth + DB + Realtime) or **Firebase** as BaaS, **Stripe** for payments, **Mux** (or **Vimeo Live**) for live streams.

---

## 1) High‑Level Architecture

```
[Client: React/Vite Shell]
  ├─ Unity WebGL Build (Lobby/World)
  │    └─ Exposed JS Interop (SendMessage) for navigation/events
  ├─ Three.js Mini‑Games (Arcade)
  ├─ UI Screens (Auth, Profile, Store overlays)
  └─ API Client (REST/RPC to Supabase/Firebase)

[Backend: Supabase]
  ├─ Auth (email/password, magic link, OTP SMS optional)
  ├─ Postgres (profiles, products, orders, leaderboards, messages)
  ├─ Realtime (Arcade scores, chat)
  ├─ Storage (images, audio previews, cover art)
  └─ Edge Functions (secure server logic, webhooks)

[Payments]
  └─ Stripe (Checkout, Payment Links, Webhooks → fulfill entitlements)

[Streaming]
  └─ Mux/Vimeo Live (RTMP ingest → HLS playback in Ballroom)
```
... (content truncated for brevity in this step) ...
