// Theatre API Service for Venue 5
const API_BASE_URL = 'http://localhost:4000/api';

export interface TheatreEvent {
  id: string;
  title: string;
  subtitle?: string;
  description_md?: string;
  start_at: string;
  end_at?: string;
  visibility: 'listed' | 'unlisted' | 'private';
  age_restriction: 'all' | '13+' | '18+' | '21+';
  tags: string[];
  poster_image_url?: string;
  trailer_video_url?: string;
  access_mode: 'ticket_required' | 'invite_only' | 'public_free';
  max_capacity: number;
  record_vod: boolean;
  enable_drm: boolean;
  current_viewers?: number;
  created_at: string;
  updated_at: string;
}

export interface TheatreTicket {
  id: string;
  ticket_id: string;
  event_id: string;
  user_id: string;
  type: 'free' | 'paid' | 'vip' | 'backstage';
  price_cents: number;
  currency: string;
  purchased_at: string;
  admit_from?: string;
  admit_until?: string;
  seat_label?: string;
  transferable: boolean;
  used_at?: string;
  qr_code_data?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  user_id?: string;
  ts: number;
  created_at: string;
}

export interface AuthResponse {
  ok: boolean;
  token: string;
  user: {
    id: string;
    email?: string;
    phone?: string;
    guest_username?: string;
    role: string;
  };
}

class TheatreApiService {
  private baseUrl: string;
  private wsConnections: Map<string, WebSocket> = new Map();

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Auth endpoints
  async register(data: { email?: string; phone?: string; guest_username?: string }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async login(data: { email?: string; phone?: string; guest_username?: string }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Event endpoints
  async getEvents(): Promise<TheatreEvent[]> {
    const response = await fetch(`${this.baseUrl}/events`);
    return response.json();
  }

  async getEvent(eventId: string): Promise<TheatreEvent> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}`);
    if (!response.ok) {
      throw new Error(`Event not found: ${eventId}`);
    }
    return response.json();
  }

  // Ticket endpoints
  async purchaseTicket(eventId: string, data: {
    type?: string;
    price_cents?: number;
    currency?: string;
    user_id?: string;
  }): Promise<TheatreTicket> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async validateTicket(eventId: string, ticketId: string): Promise<{ valid: boolean; ticket?: TheatreTicket; error?: string }> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: ticketId })
    });
    return response.json();
  }

  // Chat endpoints
  async getChatHistory(eventId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/chat/history`);
    return response.json();
  }

  async postChatMessage(eventId: string, data: {
    user?: string;
    text: string;
    display_name?: string;
    user_id?: string;
  }): Promise<{ ok: boolean; message: ChatMessage }> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/chat/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // WebSocket connection for real-time features
  connectWebSocket(eventId: string, onMessage: (data: any) => void): WebSocket {
    const wsUrl = `ws://localhost:4000/events/${eventId}/live`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`Connected to theatre WebSocket for event: ${eventId}`);
      // Send ping to keep connection alive
      ws.send(JSON.stringify({ type: 'ping' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log(`Disconnected from theatre WebSocket for event: ${eventId}`);
      this.wsConnections.delete(eventId);
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for event ${eventId}:`, error);
    };

    this.wsConnections.set(eventId, ws);
    return ws;
  }

  // Send chat message via WebSocket
  sendChatMessage(eventId: string, message: string, user: string, displayName?: string, userId?: string) {
    const ws = this.wsConnections.get(eventId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'chat_message',
        user,
        text: message,
        display_name: displayName,
        user_id: userId
      }));
    }
  }

  // Disconnect WebSocket
  disconnectWebSocket(eventId: string) {
    const ws = this.wsConnections.get(eventId);
    if (ws) {
      ws.close();
      this.wsConnections.delete(eventId);
    }
  }

  // Disconnect all WebSockets
  disconnectAll() {
    this.wsConnections.forEach((ws, eventId) => {
      ws.close();
    });
    this.wsConnections.clear();
  }
}

// Export singleton instance
export const theatreApi = new TheatreApiService();
export default theatreApi;
