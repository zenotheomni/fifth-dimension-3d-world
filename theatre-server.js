const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

// CORS configuration for theatre system
const corsOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5500',
  'https://5dimperial.com',
  'https://live.5dimperial.com'
];
app.use(cors({ origin: corsOrigins, credentials: true }));

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// WebSocket server for real-time chat
const wss = new WebSocket.Server({ server });

// Store chat messages in memory (in production, use a database)
const chatMessages = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const eventId = url.pathname.split('/')[3]; // /events/{eventId}/chat
  
  if (!chatMessages.has(eventId)) {
    chatMessages.set(eventId, []);
  }
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      if (message.type === 'chat_message') {
        const chatData = {
          user: message.payload.user,
          text: message.payload.text,
          ts: new Date().toISOString()
        };
        
        // Store message
        chatMessages.get(eventId).push(chatData);
        
        // Broadcast to all connected clients for this event
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(JSON.stringify({
              type: 'chat_message',
              payload: chatData
            }));
          }
        });
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
});

// API Routes
app.get('/api/events/:eventId', (req, res) => {
  const { eventId } = req.params;
  
  // Mock event data
  const eventData = {
    id: eventId,
    title: eventId === 'demo' ? 'ZENO RELOADED Live (Demo)' : 'Fifth Dimension Live',
    access_mode: 'public_free',
    start_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString() // 2 hours later
  };
  
  res.json(eventData);
});

app.get('/api/events/:eventId/chat/history', (req, res) => {
  const { eventId } = req.params;
  const messages = chatMessages.get(eventId) || [];
  res.json(messages.slice(-50)); // Return last 50 messages
});

app.post('/api/events/:eventId/chat/post', (req, res) => {
  const { eventId } = req.params;
  const { user, text } = req.body;
  
  if (!user || !text) {
    return res.status(400).json({ error: 'User and text are required' });
  }
  
  const message = {
    user: user.slice(0, 20), // Limit username length
    text: text.slice(0, 400), // Limit message length
    ts: new Date().toISOString()
  };
  
  if (!chatMessages.has(eventId)) {
    chatMessages.set(eventId, []);
  }
  
  chatMessages.get(eventId).push(message);
  
  // Broadcast to WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'chat_message',
        payload: message
      }));
    }
  });
  
  res.json({ success: true });
});

// Ticketing API
app.get('/api/events/:eventId/tickets', (req, res) => {
  const { eventId } = req.params;
  
  // Load ticketing configuration
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
      },
      {
        "name": "General Admission",
        "code": "ga",
        "price_cents": 2500,
        "on_sale_start_iso": "2025-11-01T00:00:00Z",
        "on_sale_end_iso": "2025-12-12T23:59:59Z",
        "quantity_cap": 1000,
        "per_user_limit": 4,
        "visible": true
      },
      {
        "name": "Day Of (Gate)",
        "code": "day_of",
        "price_cents": 3500,
        "on_sale_start_relative": {
          "hours_before_event": 12
        },
        "on_sale_end_relative": {
          "minutes_before_event": 0
        },
        "quantity_cap": 300,
        "per_user_limit": 2,
        "visible": true,
        "enabled": true
      }
    ]
  };
  
  res.json(ticketingConfig);
});

// Notification subscription
app.post('/api/events/:eventId/notify', (req, res) => {
  const { eventId } = req.params;
  const { email, phone } = req.body;
  
  // In production, store this in a database and set up actual notification scheduling
  console.log(`Notification subscription for event ${eventId}:`, { email, phone });
  
  res.json({ 
    success: true, 
    message: 'You will receive reminders at 7 days, 24 hours, and 1 hour before the event' 
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🎭 Fifth Dimension Theatre Server running on port ${PORT}`);
  console.log(`🌐 Theatre available at: http://localhost:${PORT}/theatre/index.html`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/events/{eventId}/chat`);
});
