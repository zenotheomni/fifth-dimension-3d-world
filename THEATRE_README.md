# Fifth Dimension Theatre System

A cosmic-themed live streaming theatre with integrated ticketing, merch, and real-time chat.

## Features

### 🌌 Cosmic Ambience
- Three.js powered starfield and nebula effects
- Dynamic lighting and particle systems
- Immersive cosmic vignette overlays

### 🎫 Advanced Ticketing System
- **Early Bird Tickets**: $15.00 (Oct 1 - Nov 1)
- **General Admission**: $25.00 (Nov 1 - Dec 12)
- **Day Of (Gate)**: $35.00 (12 hours before event)
- Dynamic sale windows and availability
- Per-user purchase limits

### 📧 Smart Notifications
- Email reminders at 7 days, 24 hours, and 1 hour before events
- SMS notifications (Twilio/MessageBird integration ready)
- Opt-in subscription system

### 🛍️ Merch Integration
- Inline checkout system
- Product rotation and recommendations
- Seamless payment flow (demo mode)

### 💬 Real-time Chat
- WebSocket-powered live chat
- Message history
- Guest username system

### 📱 Responsive Design
- 3/4 layout with sidebar chat
- Fullscreen mode for immersive viewing
- Picture-in-Picture support

## Quick Start

### 1. Install Dependencies
```bash
npm install express cors ws
# or for development
npm install express cors ws nodemon
```

### 2. Start the Server
```bash
# Production
node theatre-server.js

# Development with auto-reload
npm run dev
```

### 3. Access the Theatre
- **Local**: http://localhost:4000/theatre/index.html?event=demo
- **Production**: https://5dimperial.com/theatre/index.html?event=demo

## API Endpoints

### Events
- `GET /api/events/:eventId` - Get event details
- `GET /api/events/:eventId/tickets` - Get ticketing configuration

### Chat
- `GET /api/events/:eventId/chat/history` - Get chat history
- `POST /api/events/:eventId/chat/post` - Send chat message
- `WebSocket /events/:eventId/chat` - Real-time chat connection

### Notifications
- `POST /api/events/:eventId/notify` - Subscribe to event reminders

## Configuration

### CORS Origins
The server is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5500`
- `https://5dimperial.com`
- `https://live.5dimperial.com`

### Ticketing Configuration
Edit the ticketing tiers in `theatre-server.js` or load from `theatre-ticketing-config.json`:

```javascript
const ticketingConfig = {
  "tiers": [
    {
      "name": "Early Bird",
      "code": "early_bird",
      "price_cents": 1500,
      "on_sale_start_iso": "2025-10-01T12:00:00Z",
      "on_sale_end_iso": "2025-11-01T00:00:00Z",
      "quantity_cap": 200,
      "per_user_limit": 2,
      "visible": true
    }
    // ... more tiers
  ]
};
```

## Embedding

Use the iframe embed code:

```html
<iframe
  src="https://5dimperial.com/theatre/index.html?event=demo"
  width="100%"
  height="780"
  style="border:0; border-radius:16px; overflow:hidden;"
  allow="autoplay; fullscreen; picture-in-picture"
></iframe>
```

## Development

### File Structure
```
public/theatre/
├── index.html          # Main theatre interface
theatre-server.js       # Express server with WebSocket
theatre-package.json    # Dependencies
theatre-ticketing-config.json # Ticketing configuration
```

### Key Technologies
- **Frontend**: HTML5, CSS3, Three.js, HLS.js
- **Backend**: Node.js, Express, WebSocket
- **Streaming**: HLS (HTTP Live Streaming)
- **Payments**: Stripe integration ready
- **Notifications**: SendGrid, Twilio ready

## Production Deployment

1. Set environment variables:
   ```bash
   export PORT=4000
   export NODE_ENV=production
   ```

2. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start theatre-server.js --name "theatre"
   ```

3. Configure reverse proxy (nginx):
   ```nginx
   location /theatre/ {
       proxy_pass http://localhost:4000/theatre/;
   }
   location /api/ {
       proxy_pass http://localhost:4000/api/;
   }
   location /events/ {
       proxy_pass http://localhost:4000/events/;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
   }
   ```

## License

MIT License - See LICENSE file for details.
