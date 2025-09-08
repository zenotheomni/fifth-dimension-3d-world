# Fifth Dimension • Theatre Room Starter (v1.0)

Generated: 2025-09-08

---

## 📦 What's Included
- **db_schema.sql** — Postgres schema for core tables (users, events, tickets, orders, chat, bans, moderation).
- **api_stubs.js** — Minimal Node/Express REST + WebSocket server with in-memory storage + demo event.
- **theatre_wireframe_threejs_live.html** — Standalone HTML wireframe using Three.js + hls.js that shows:
  - Fullscreen vs 3/4 layout toggle
  - Dummy HLS video stream (public test stream from Mux)
  - Chat UI wired to API (history + post + WebSocket live updates)

---

## ▶️ Run the API Server (dev)

```bash
# 1) Create a new folder
mkdir 5d-theatre && cd 5d-theatre

# 2) Init Node project
npm init -y

# 3) Install dependencies
npm i express ws body-parser cors

# 4) Run the stub server
node api_stubs.js

# REST: http://localhost:4000
# WS:   ws://localhost:4000/events/:eventId/chat
```

---

## 🎭 Theatre Room Features

### **Core Functionality**
- **Live Streaming**: HLS/DASH video playback with fullscreen support
- **Ticketing System**: Free, paid, VIP, and backstage pass tiers
- **Real-time Chat**: WebSocket-powered chat with mentions, emojis, and reactions
- **Event Management**: Create, schedule, and manage theatre events
- **User Authentication**: Email, phone, and guest username support
- **Moderation Tools**: Message deletion, user muting/banning, AI toxicity filtering

### **Database Schema**
- `theatre_users` - Extended user profiles with theatre-specific roles
- `theatre_events` - Event details, scheduling, and access controls
- `theatre_tickets` - Ticket types, pricing, and QR code validation
- `theatre_orders` - Payment processing and order management
- `theatre_chat_messages` - Real-time chat with threading support
- `theatre_bans` - User moderation and access restrictions
- `theatre_moderation_actions` - Audit trail for moderation decisions

### **API Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/events/:eventId` - Event details
- `POST /api/events/:eventId/tickets` - Purchase tickets
- `POST /api/events/:eventId/validate` - Validate tickets
- `GET /api/events/:eventId/chat/history` - Chat history
- `POST /api/events/:eventId/chat/post` - Send chat message
- `WS /events/:eventId/chat` - Real-time chat WebSocket

### **Frontend Components**
- `Venue5.tsx` - Main theatre room interface
- `VideoPlayer.tsx` - HLS/DASH video player with controls
- `TicketingSystem.tsx` - Ticket purchase and management
- `theatreApi.ts` - API service layer for backend integration

---

## 🚀 Quick Start

1. **Clone and Setup**:
   ```bash
   git clone <repository>
   cd 5du
   pnpm install
   ```

2. **Start Development Servers**:
   ```bash
   # Start React app
   pnpm run dev

   # Start theatre API server
   pnpm run theatre:api

   # Or run both simultaneously
   pnpm run dev:full
   ```

3. **Access the Application**:
   - React App: http://localhost:3000/venue5
   - API Server: http://localhost:4000
   - Test Page: http://localhost:3000/theatre-test.html

---

## 🎫 Testing the Ticketing System

### **Available Events**
- `demo` - Free event for testing
- `fd-theatre-0001` - Paid event ($25 General, $75 VIP, $150 Backstage)
- `fd-theatre-0002` - Free event with capacity limits

### **Test Ticket Purchase**
```bash
curl -X POST http://localhost:4000/api/events/fd-theatre-0001/tickets \
  -H "Content-Type: application/json" \
  -d '{"type": "paid", "price_cents": 2500, "currency": "USD", "user_id": "test-user"}'
```

### **Test Ticket Validation**
```bash
curl -X POST http://localhost:4000/api/events/fd-theatre-0001/validate \
  -H "Content-Type: application/json" \
  -d '{"ticket_id": "FD-xxxxxxxx"}'
```

---

## 🔧 Development Notes

- **Module System**: Uses ES modules (`import`/`export`) for modern Node.js compatibility
- **Package Manager**: Uses `pnpm` for faster dependency management
- **Database**: Supabase Postgres with Row Level Security (RLS) policies
- **Streaming**: HLS.js for video playback with DRM support
- **Real-time**: WebSocket for live chat and viewer updates
- **Authentication**: JWT-based sessions with guest username support

---

## 📝 Next Steps

1. **Production Integration**: Connect to real Supabase instance
2. **Payment Processing**: Integrate Stripe for real payments
3. **Email Notifications**: Send ticket confirmations and updates
4. **Analytics**: Track viewer engagement and revenue metrics
5. **Mobile Support**: Optimize for mobile devices and PWA features

---

## 🤝 Contributing

This is a starter template for building theatre/ballroom streaming experiences. Feel free to extend and customize for your specific use case.

**Happy Streaming! 🎭✨**
