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
const users = new Map(); // user_id -> user data
const sessions = new Map(); // token -> user_id

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

// --- Authentication helpers ---
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateUserId() {
  return 'user_' + crypto.randomBytes(16).toString('hex');
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const userId = sessions.get(token);
  if (!userId || !users.has(userId)) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
  
  req.user = users.get(userId);
  req.userId = userId;
  next();
}

// --- Authentication endpoints ---
app.post('/api/auth/register', (req, res) => {
  const { email, phone, password, display_name } = req.body;
  
  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone required' });
  }
  
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  // Check if user already exists
  for (const [userId, user] of users) {
    if ((email && user.email === email) || (phone && user.phone === phone)) {
      return res.status(409).json({ error: 'User already exists' });
    }
  }
  
  const userId = generateUserId();
  const token = generateToken();
  
  const user = {
    id: userId,
    email: email || null,
    phone: phone || null,
    display_name: display_name || email || phone,
    role: 'user',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  };
  
  users.set(userId, user);
  sessions.set(token, userId);
  
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      display_name: user.display_name,
      role: user.role
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, phone, password } = req.body;
  
  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone required' });
  }
  
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }
  
  // Find user
  let user = null;
  for (const [userId, u] of users) {
    if ((email && u.email === email) || (phone && u.phone === phone)) {
      user = u;
      break;
    }
  }
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // In a real app, verify password hash here
  // For demo, we'll accept any password
  
  const token = generateToken();
  sessions.set(token, user.id);
  
  // Update last login
  user.last_login = new Date().toISOString();
  users.set(user.id, user);
  
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      display_name: user.display_name,
      role: user.role
    }
  });
});

app.post('/api/auth/guest', (req, res) => {
  const { username, display_name } = req.body;
  
  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  
  // Check if guest username is already taken
  for (const [userId, user] of users) {
    if (user.display_name === username && user.role === 'guest') {
      return res.status(409).json({ error: 'Username already taken' });
    }
  }
  
  const userId = generateUserId();
  const token = generateToken();
  
  const user = {
    id: userId,
    email: null,
    phone: null,
    display_name: display_name || username,
    role: 'guest',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
  
  users.set(userId, user);
  sessions.set(token, userId);
  
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      display_name: user.display_name,
      role: user.role
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      phone: req.user.phone,
      display_name: req.user.display_name,
      role: req.user.role
    }
  });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    sessions.delete(token);
  }
  
  res.json({ message: 'Logged out successfully' });
});

// Event management endpoints
app.get('/api/events', (req, res) => {
  const eventList = Object.values(events).map(event => ({
    ...event,
    current_viewers: participants[event.id] ? participants[event.id].size : Math.floor(Math.random() * 1000) + 100
  }));
  res.json(eventList);
});

app.post('/api/events', authenticateToken, (req, res) => {
  const {
    title, subtitle, description_md, start_at, end_at, visibility, age_restriction,
    tags, poster_image_url, trailer_video_url, access_mode, max_capacity,
    record_vod, enable_drm, created_by
  } = req.body;

  if (!title || !start_at || !end_at) {
    return res.status(400).json({ error: 'Title, start time, and end time are required' });
  }

  const eventId = 'event_' + crypto.randomBytes(16).toString('hex');
  const now = new Date().toISOString();

  const event = {
    id: eventId,
    title,
    subtitle: subtitle || '',
    description_md: description_md || '',
    start_at,
    end_at,
    visibility: visibility || 'draft',
    age_restriction: age_restriction || '13+',
    tags: tags || [],
    poster_image_url: poster_image_url || '',
    trailer_video_url: trailer_video_url || '',
    access_mode: access_mode || 'public_free',
    max_capacity: max_capacity || 1000,
    record_vod: record_vod !== false,
    enable_drm: enable_drm === true,
    created_by: created_by || req.userId,
    created_at: now,
    updated_at: now
  };

  events[eventId] = event;

  res.status(201).json({
    event,
    message: 'Event created successfully'
  });
});

app.put('/api/events/:eventId', authenticateToken, (req, res) => {
  const eventId = req.params.eventId;
  const event = events[eventId];

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Check if user can edit this event (creator or admin)
  if (event.created_by !== req.userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to edit this event' });
  }

  const {
    title, subtitle, description_md, start_at, end_at, visibility, age_restriction,
    tags, poster_image_url, trailer_video_url, access_mode, max_capacity,
    record_vod, enable_drm
  } = req.body;

  // Update event
  const updatedEvent = {
    ...event,
    title: title || event.title,
    subtitle: subtitle !== undefined ? subtitle : event.subtitle,
    description_md: description_md !== undefined ? description_md : event.description_md,
    start_at: start_at || event.start_at,
    end_at: end_at || event.end_at,
    visibility: visibility || event.visibility,
    age_restriction: age_restriction || event.age_restriction,
    tags: tags || event.tags,
    poster_image_url: poster_image_url !== undefined ? poster_image_url : event.poster_image_url,
    trailer_video_url: trailer_video_url !== undefined ? trailer_video_url : event.trailer_video_url,
    access_mode: access_mode || event.access_mode,
    max_capacity: max_capacity || event.max_capacity,
    record_vod: record_vod !== undefined ? record_vod : event.record_vod,
    enable_drm: enable_drm !== undefined ? enable_drm : event.enable_drm,
    updated_at: new Date().toISOString()
  };

  events[eventId] = updatedEvent;

  res.json({
    event: updatedEvent,
    message: 'Event updated successfully'
  });
});

app.delete('/api/events/:eventId', authenticateToken, (req, res) => {
  const eventId = req.params.eventId;
  const event = events[eventId];

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Check if user can delete this event (creator or admin)
  if (event.created_by !== req.userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to delete this event' });
  }

  delete events[eventId];
  
  // Clean up related data
  delete tickets[eventId];
  delete chatHistory[eventId];
  delete participants[eventId];

  res.json({ message: 'Event deleted successfully' });
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

// --- Moderation endpoints ---
app.post('/api/events/:eventId/chat/moderate', authenticateToken, (req, res) => {
  const eventId = req.params.eventId;
  const { action, message_id, user_id, reason, duration_minutes, is_permanent } = req.body;

  // Check if user has moderation permissions
  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  if (action === 'delete_message') {
    if (!message_id) {
      return res.status(400).json({ error: 'Message ID required' });
    }

    // Find and mark message as deleted
    const eventChat = chatHistory[eventId] || [];
    const messageIndex = eventChat.findIndex(msg => msg.id === message_id);
    
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    eventChat[messageIndex].is_deleted = true;
    eventChat[messageIndex].deleted_by = req.userId;
    eventChat[messageIndex].deleted_at = new Date().toISOString();
    eventChat[messageIndex].deletion_reason = reason;

    res.json({ message: 'Message deleted successfully' });

  } else if (action === 'mute_user') {
    if (!user_id || !duration_minutes) {
      return res.status(400).json({ error: 'User ID and duration required' });
    }

    // In a real app, store mute in database
    // For demo, we'll just return success
    res.json({ 
      message: `User muted for ${duration_minutes} minutes`,
      muted_until: new Date(Date.now() + duration_minutes * 60 * 1000).toISOString()
    });

  } else if (action === 'ban_user') {
    if (!user_id) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // In a real app, store ban in database
    // For demo, we'll just return success
    res.json({ 
      message: is_permanent ? 'User permanently banned' : 'User banned for 24 hours',
      banned_until: is_permanent ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

  } else {
    res.status(400).json({ error: 'Invalid action' });
  }
});

// --- Analytics endpoints ---
app.get('/api/events/:eventId/analytics', authenticateToken, (req, res) => {
  const eventId = req.params.eventId;
  const { range = '24h' } = req.query;

  // Check if user has access to analytics (event creator or admin)
  const event = events[eventId];
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (event.created_by !== req.userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to view analytics' });
  }

  // Generate mock analytics data
  const now = new Date();
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    return {
      hour: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      viewers: Math.floor(Math.random() * 500) + 100,
      messages: Math.floor(Math.random() * 200) + 50
    };
  });

  const analyticsData = {
    overview: {
      totalViewers: 2847,
      peakViewers: 1243,
      totalRevenue: 45670,
      totalMessages: 3421,
      averageWatchTime: 47.3,
      engagementRate: 23.7
    },
    viewerMetrics: {
      hourly: hours.map(h => ({ hour: h.hour, viewers: h.viewers })),
      demographics: [
        { ageGroup: '18-24', percentage: 35 },
        { ageGroup: '25-34', percentage: 28 },
        { ageGroup: '35-44', percentage: 20 },
        { ageGroup: '45-54', percentage: 12 },
        { ageGroup: '55+', percentage: 5 }
      ],
      retention: Array.from({ length: 60 }, (_, i) => ({
        minute: i + 1,
        percentage: Math.max(0, 100 - (i * 1.2) + Math.random() * 10)
      }))
    },
    revenueMetrics: {
      totalRevenue: 45670,
      ticketSales: 38920,
      donations: 4200,
      merchandise: 2550,
      dailyRevenue: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        revenue: Math.floor(Math.random() * 8000) + 2000
      })),
      ticketTypes: [
        { type: 'General', count: 1247, revenue: 31175 },
        { type: 'VIP', count: 89, revenue: 6675 },
        { type: 'Backstage', count: 23, revenue: 3450 }
      ]
    },
    engagementMetrics: {
      chatActivity: hours.map(h => ({ hour: h.hour, messages: h.messages })),
      reactions: [
        { type: '❤️', count: 1247 },
        { type: '🔥', count: 892 },
        { type: '👏', count: 634 },
        { type: '🎉', count: 423 },
        { type: '😍', count: 298 }
      ],
      shares: 156,
      downloads: 89
    }
  };

  res.json(analyticsData);
});

// --- Notification endpoints ---
app.get('/api/events/:eventId/ticket-tiers', (req, res) => {
  const eventId = req.params.eventId;
  const event = events[eventId];
  
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Mock ticket tiers data
  const tiers = [
    {
      name: "Early Bird",
      code: "early_bird",
      price_cents: 1500,
      on_sale_start_iso: "2025-10-01T12:00:00Z",
      on_sale_end_iso: "2025-11-01T00:00:00Z",
      quantity_cap: 200,
      per_user_limit: 2,
      visible: true,
      sold_count: Math.floor(Math.random() * 50) + 20
    },
    {
      name: "General Admission",
      code: "ga",
      price_cents: 2500,
      on_sale_start_iso: "2025-11-01T00:00:00Z",
      on_sale_end_iso: "2025-12-12T23:59:59Z",
      quantity_cap: 1000,
      per_user_limit: 4,
      visible: true,
      sold_count: Math.floor(Math.random() * 300) + 100
    },
    {
      name: "Day Of (Gate)",
      code: "day_of",
      price_cents: 3500,
      on_sale_start_relative: {
        hours_before_event: 12
      },
      on_sale_end_relative: {
        minutes_before_event: 0
      },
      quantity_cap: 300,
      per_user_limit: 2,
      visible: true,
      enabled: true,
      sold_count: Math.floor(Math.random() * 50) + 5
    }
  ];

  res.json({ tiers });
});

app.post('/api/events/:eventId/notifications/schedule', authenticateToken, (req, res) => {
  const eventId = req.params.eventId;
  const { ticket_id, preferences } = req.body;

  if (!ticket_id || !preferences) {
    return res.status(400).json({ error: 'Ticket ID and preferences required' });
  }

  // In a real implementation, this would schedule notifications with a job queue
  // For now, we'll just return success
  const scheduledNotifications = [
    {
      id: 'notif_1',
      ticket_id,
      schedule_name: 'T-7 days',
      reminder_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      preferences
    },
    {
      id: 'notif_2',
      ticket_id,
      schedule_name: 'T-24 hours',
      reminder_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      preferences
    },
    {
      id: 'notif_3',
      ticket_id,
      schedule_name: 'T-1 hour',
      reminder_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      preferences
    }
  ];

  res.json({
    message: 'Notifications scheduled successfully',
    notifications: scheduledNotifications
  });
});

app.get('/api/notifications/status/:ticketId', authenticateToken, (req, res) => {
  const ticketId = req.params.ticketId;
  
  // Mock notification status
  const notifications = [
    {
      id: 'notif_1',
      ticket_id: ticketId,
      schedule_name: 'T-7 days',
      reminder_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      sent_at: null
    },
    {
      id: 'notif_2',
      ticket_id: ticketId,
      schedule_name: 'T-24 hours',
      reminder_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      sent_at: null
    },
    {
      id: 'notif_3',
      ticket_id: ticketId,
      schedule_name: 'T-1 hour',
      reminder_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      sent_at: null
    }
  ];

  res.json({ notifications });
});

app.put('/api/notifications/preferences/:ticketId', authenticateToken, (req, res) => {
  const ticketId = req.params.ticketId;
  const preferences = req.body;

  // In a real implementation, this would update the database
  res.json({
    message: 'Notification preferences updated successfully',
    preferences
  });
});

app.post('/api/notifications/send-test', authenticateToken, (req, res) => {
  const { event_id, ticket_id, notification_type } = req.body;

  // Mock sending a test notification
  console.log(`Sending test ${notification_type} notification for ticket ${ticket_id}`);

  res.json({
    message: `Test ${notification_type} notification sent successfully`,
    sent_at: new Date().toISOString()
  });
});

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
