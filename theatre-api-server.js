/**
 * Fifth Dimension Theatre Room - API & WS Stubs (v1.0)
 * Minimal Express + WS server. Replace in-memory stores with Postgres access.
 */
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import bodyParser from 'body-parser';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- In-memory stores (replace with DB) ---
const events = {
  "demo": {
    id: "demo",
    title: "ZENO RELOADED Live (Demo)",
    subtitle: "Immersive Concert Stream",
    description_md: "Join us for an interdimensional music experience featuring the legendary ZENO RELOADED in a never-before-seen virtual performance.",
    start_at: new Date(Date.now() + 60000).toISOString(),
    end_at: new Date(Date.now() + 60000 + 90 * 60 * 1000).toISOString(), // 90 minutes later
    visibility: "listed",
    age_restriction: "13+",
    tags: ["concert", "hip-hop", "fifth-dimension"],
    poster_image_url: "https://images.unsplash.com/photo-1571266028243-d220bc560fdd?w=600&h=400&fit=crop",
    trailer_video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    access_mode: "public_free",
    max_capacity: 5000,
    record_vod: true,
    enable_drm: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  "fd-theatre-0001": {
    id: "fd-theatre-0001",
    title: "ZENO RELOADED Live",
    subtitle: "Immersive Concert Stream",
    description_md: "Join us for an interdimensional music experience featuring the legendary ZENO RELOADED in a never-before-seen virtual performance.",
    start_at: new Date(Date.now() + 60000).toISOString(),
    end_at: new Date(Date.now() + 60000 + 90 * 60 * 1000).toISOString(),
    visibility: "listed",
    age_restriction: "13+",
    tags: ["concert", "hip-hop", "fifth-dimension"],
    poster_image_url: "https://images.unsplash.com/photo-1571266028243-d220bc560fdd?w=600&h=400&fit=crop",
    trailer_video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    access_mode: "ticket_required",
    max_capacity: 5000,
    record_vod: true,
    enable_drm: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  "fd-theatre-0002": {
    id: "fd-theatre-0002",
    title: "Vegas Nights: Casino Culture Deep Dive",
    subtitle: "Interactive Documentary",
    description_md: "Exploring the glittering world of casino culture with live Q&A and behind-the-scenes footage.",
    start_at: new Date(Date.now() + 120000).toISOString(),
    end_at: new Date(Date.now() + 120000 + 90 * 60 * 1000).toISOString(),
    visibility: "listed",
    age_restriction: "18+",
    tags: ["documentary", "casino", "culture"],
    poster_image_url: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&h=400&fit=crop",
    trailer_video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    access_mode: "public_free",
    max_capacity: 3000,
    record_vod: true,
    enable_drm: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
};

const tickets = {};
const chatHistory = {}; // eventId -> [{id, user, text, ts}]
const participants = {}; // eventId -> Set<userId>

// Utils
const uid = () => crypto.randomBytes(8).toString('hex');

// ---- REST ----
app.post('/api/auth/register', (req, res) => {
  const { email, phone, guest_username } = req.body;
  const userId = uid();
  return res.json({ 
    ok: true, 
    userId,
    token: 'mock-jwt.' + uid(),
    user: { id: userId, email, phone, guest_username, role: 'viewer' }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, phone, guest_username } = req.body;
  const userId = uid();
  return res.json({ 
    ok: true, 
    token: 'mock-jwt.' + uid(),
    user: { id: userId, email, phone, guest_username, role: 'viewer' }
  });
});

app.get('/api/events', (req, res) => {
  const eventList = Object.values(events).map(event => ({
    ...event,
    current_viewers: participants[event.id] ? participants[event.id].size : Math.floor(Math.random() * 1000) + 100
  }));
  res.json(eventList);
});

app.get('/api/events/:eventId', (req, res) => {
  const event = events[req.params.eventId];
  if (!event) return res.status(404).json({ error: 'Event not found' });
  
  const eventWithViewers = {
    ...event,
    current_viewers: participants[event.id] ? participants[event.id].size : Math.floor(Math.random() * 1000) + 100
  };
  
  res.json(eventWithViewers);
});

app.post('/api/events/:eventId/tickets', (req, res) => {
  const { type = 'paid', price_cents = 0, currency = 'USD', user_id } = req.body || {};
  const ticketId = uid();
  const ticket = { 
    id: ticketId,
    ticket_id: `FD-${ticketId}`,
    event_id: req.params.eventId,
    user_id: user_id || uid(),
    type, 
    price_cents, 
    currency, 
    purchased_at: new Date().toISOString(),
    admit_from: new Date().toISOString(),
    admit_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    transferable: type !== 'free',
    qr_code_data: `FD-${ticketId}-${user_id || 'guest'}`,
    created_at: new Date().toISOString()
  };
  tickets[ticket.id] = ticket;
  res.json(ticket);
});

app.post('/api/events/:eventId/validate', (req, res) => {
  const { ticket_id } = req.body || {};
  const ticket = Object.values(tickets).find(t => t.ticket_id === ticket_id || t.id === ticket_id);
  if (ticket && ticket.event_id === req.params.eventId) {
    return res.json({ valid: true, ticket });
  }
  res.status(400).json({ valid: false, error: 'Invalid ticket' });
});

app.get('/api/events/:eventId/chat/history', (req, res) => {
  const arr = chatHistory[req.params.eventId] || [];
  res.json(arr.slice(-200)); // last 200 messages
});

app.post('/api/events/:eventId/chat/post', (req, res) => {
  const { user = 'guest', text = '', display_name, user_id } = req.body || {};
  if (!text.trim()) return res.status(400).json({ error: 'Message cannot be empty' });
  
  const msg = { 
    id: uid(), 
    user: display_name || user, 
    text: text.trim(), 
    user_id: user_id || 'guest',
    ts: Date.now(),
    created_at: new Date().toISOString()
  };
  
  chatHistory[req.params.eventId] = (chatHistory[req.params.eventId] || []).concat([msg]);
  
  // Broadcast to WebSocket clients
  const room = wsRooms.get(req.params.eventId);
  if (room) {
    const data = JSON.stringify({ type: 'chat_message', payload: msg });
    for (const client of room) {
      try { 
        client.send(data); 
      } catch (e) {
        console.error('Error sending to client:', e);
      }
    }
  }
  
  res.json({ ok: true, message: msg });
});

app.get('/api/events/:eventId/participants', (req, res) => {
  const eventParticipants = participants[req.params.eventId] || new Set();
  res.json({ 
    count: eventParticipants.size,
    participants: Array.from(eventParticipants).map(id => ({ id, display_name: `User_${id.slice(0, 6)}` }))
  });
});

// ---- HTTP Server ----
const server = http.createServer(app);

// ---- WebSocket (live + chat) ----
const wss = new WebSocketServer({ server });
const wsRooms = new Map(); // eventId -> Set<WebSocket>

wss.on('connection', (socket, req) => {
  const url = req.url || '';
  const parts = url.split('/').filter(Boolean);
  const eventIdIndex = parts.indexOf('events') + 1;
  const eventId = parts[eventIdIndex] || 'demo';
  
  let room = wsRooms.get(eventId);
  if (!room) { 
    room = new Set(); 
    wsRooms.set(eventId, room); 
  }
  room.add(socket);

  // Add to participants
  if (!participants[eventId]) {
    participants[eventId] = new Set();
  }
  const userId = uid();
  participants[eventId].add(userId);

  // Send current viewer count
  socket.send(JSON.stringify({ 
    type: 'viewer_count', 
    payload: { count: participants[eventId].size } 
  }));

  socket.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      
      if (msg.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
      }
      
      if (msg.type === 'chat_message') {
        const { user = 'guest', text = '', display_name, user_id } = msg;
        if (!text.trim()) return;
        
        const payload = { 
          id: uid(), 
          user: display_name || user, 
          text: text.trim(), 
          user_id: user_id || 'guest',
          ts: Date.now(),
          created_at: new Date().toISOString()
        };
        
        chatHistory[eventId] = (chatHistory[eventId] || []).concat([payload]);
        
        // Broadcast to all clients in room
        for (const client of room) {
          try { 
            client.send(JSON.stringify({ type: 'chat_message', payload })); 
          } catch (e) {
            console.error('Error broadcasting message:', e);
          }
        }
      }
    } catch (e) {
      console.error('Error processing message:', e);
    }
  });

  socket.on('close', () => {
    room.delete(socket);
    participants[eventId].delete(userId);
    
    // Broadcast updated viewer count
    const updatedCount = participants[eventId].size;
    for (const client of room) {
      try {
        client.send(JSON.stringify({ 
          type: 'viewer_count', 
          payload: { count: updatedCount } 
        }));
      } catch (e) {
        console.error('Error broadcasting viewer count:', e);
      }
    }
  });
});

// Simulate viewer count changes
setInterval(() => {
  Object.keys(events).forEach(eventId => {
    if (participants[eventId]) {
      const room = wsRooms.get(eventId);
      if (room && room.size > 0) {
        const currentCount = participants[eventId].size;
        const change = Math.floor(Math.random() * 6) - 3; // -3 to +3
        const newCount = Math.max(0, currentCount + change);
        
        // Update count
        participants[eventId].clear();
        for (let i = 0; i < newCount; i++) {
          participants[eventId].add(uid());
        }
        
        // Broadcast to clients
        for (const client of room) {
          try {
            client.send(JSON.stringify({ 
              type: 'viewer_count', 
              payload: { count: newCount } 
            }));
          } catch (e) {
            console.error('Error broadcasting viewer count update:', e);
          }
        }
      }
    }
  });
}, 10000); // Update every 10 seconds

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('🎭 Fifth Dimension Theatre API & WS server running on http://localhost:' + PORT);
  console.log('📡 WebSocket endpoint: ws://localhost:' + PORT);
  console.log('🎫 Available events:', Object.keys(events).join(', '));
});
