-- Fifth Dimension Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  username text unique,
  phone text,
  avatar_url text,
  opted_in_promotions boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table for the record store
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  type text check (type in ('vinyl', 'cd', 'digital', 'merchandise')) not null,
  image_url text,
  audio_preview_url text,
  artist text not null,
  genre text,
  release_date date,
  stock_quantity integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  total_amount decimal(10,2) not null,
  status text check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')) default 'pending',
  stripe_payment_intent_id text,
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_items table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null default 1,
  price decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create arcade_scores table for game leaderboards
create table public.arcade_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  game_name text not null,
  score integer not null,
  level_reached integer,
  time_played integer, -- in seconds
  game_data jsonb, -- for storing additional game-specific data
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create community_messages table
create table public.community_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  type text check (type in ('message', 'announcement', 'event')) default 'message',
  tags text[], -- array of tags
  likes integer default 0,
  is_pinned boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create message_likes table for tracking who liked what
create table public.message_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message_id uuid references public.community_messages(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, message_id)
);

-- Create live_streams table
create table public.live_streams (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  stream_url text,
  thumbnail_url text,
  is_live boolean default false,
  viewer_count integer default 0,
  max_viewers integer default 0,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  scheduled_for timestamp with time zone,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Fifth Dimension Theatre Room - Postgres Schema (v1.0)
-- Updated to match refined theatre room specification

-- Create theatre_users table (extends auth.users for theatre-specific features)
create table public.theatre_users (
  id uuid primary key default uuid_generate_v4(),
  email text unique,
  phone text,
  guest_username text unique,
  password_hash text,
  role text not null default 'viewer' check (role in ('viewer', 'mod', 'host', 'artist')),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Create theatre_events table for Venue 5
create table public.theatre_events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  description_md text,
  start_at timestamp with time zone not null,
  end_at timestamp with time zone,
  visibility text not null default 'listed' check (visibility in ('listed', 'unlisted', 'private')),
  age_restriction text default '13+' check (age_restriction in ('all', '13+', '18+', '21+')),
  tags text[] default '{}',
  poster_image_url text,
  trailer_video_url text,
  access_mode text not null default 'ticket_required' check (access_mode in ('ticket_required', 'invite_only', 'public_free')),
  max_capacity integer default 5000,
  record_vod boolean default true,
  enable_drm boolean default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Create theatre_orders table for payment processing
create table public.theatre_orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.theatre_users(id) on delete cascade,
  total_cents integer not null default 0,
  currency text not null default 'USD',
  provider text,
  provider_payment_id text,
  status text not null default 'paid' check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Create theatre_tickets table for Venue 5
create table public.theatre_tickets (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.theatre_events(id) on delete cascade,
  user_id uuid references public.theatre_users(id) on delete set null,
  type text not null check (type in ('free', 'paid', 'vip', 'backstage')),
  price_cents integer not null default 0,
  currency text not null default 'USD',
  purchased_at timestamp with time zone,
  admit_from timestamp with time zone,
  admit_until timestamp with time zone,
  seat_label text,
  transferable boolean not null default false,
  used_at timestamp with time zone,
  qr_code_data text,
  order_id uuid references public.theatre_orders(id) on delete set null,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Create theatre_chat_messages table for Venue 5 live chat
create table public.theatre_chat_messages (
  id bigserial primary key,
  event_id uuid not null references public.theatre_events(id) on delete cascade,
  user_id uuid references public.theatre_users(id) on delete set null,
  display_name text not null,
  message text not null,
  replied_to bigint references public.theatre_chat_messages(id) on delete set null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- Create theatre_bans table for user moderation
create table public.theatre_bans (
  id bigserial primary key,
  event_id uuid references public.theatre_events(id) on delete cascade,
  user_id uuid references public.theatre_users(id) on delete cascade,
  reason text,
  banned_by uuid references public.theatre_users(id),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  expires_at timestamp with time zone
);

-- Create theatre_moderation_actions table for tracking moderation
create table public.theatre_moderation_actions (
  id bigserial primary key,
  event_id uuid references public.theatre_events(id) on delete cascade,
  actor_id uuid references public.theatre_users(id),
  target_user_id uuid references public.theatre_users(id),
  action text not null check (action in ('delete_message', 'mute_user', 'ban_user', 'pin_message', 'unpin_message', 'slow_mode')),
  message_id bigint references public.theatre_chat_messages(id) on delete set null,
  meta jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Create theatre_participants table for tracking live viewers
create table public.theatre_participants (
  id bigserial primary key,
  event_id uuid not null references public.theatre_events(id) on delete cascade,
  user_id uuid references public.theatre_users(id) on delete set null,
  display_name text not null,
  joined_at timestamp with time zone not null default timezone('utc'::text, now()),
  left_at timestamp with time zone
);

-- Create chat_messages table for live stream chat (keeping existing)
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  stream_id uuid references public.live_streams(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_favorites table
create table public.user_favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_type text check (item_type in ('product', 'message', 'stream', 'game')) not null,
  item_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, item_type, item_id)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.arcade_scores enable row level security;
alter table public.community_messages enable row level security;
alter table public.message_likes enable row level security;
alter table public.chat_messages enable row level security;
alter table public.user_favorites enable row level security;
alter table public.theatre_events enable row level security;
alter table public.tickets enable row level security;
alter table public.theatre_chat_messages enable row level security;
alter table public.theatre_chat_reactions enable row level security;
alter table public.theatre_bans enable row level security;
alter table public.theatre_moderation_actions enable row level security;
alter table public.guest_usernames enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create policies for orders
create policy "Users can view own orders." on public.orders
  for select using (auth.uid() = user_id);

create policy "Users can insert own orders." on public.orders
  for insert with check (auth.uid() = user_id);

create policy "Users can update own orders." on public.orders
  for update using (auth.uid() = user_id);

-- Create policies for order_items
create policy "Users can view own order items." on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Create policies for arcade_scores
create policy "Anyone can view arcade scores." on public.arcade_scores
  for select using (true);

create policy "Users can insert own scores." on public.arcade_scores
  for insert with check (auth.uid() = user_id);

-- Create policies for community_messages
create policy "Anyone can view community messages." on public.community_messages
  for select using (true);

create policy "Users can insert own messages." on public.community_messages
  for insert with check (auth.uid() = user_id);

create policy "Users can update own messages." on public.community_messages
  for update using (auth.uid() = user_id);

-- Create policies for message_likes
create policy "Anyone can view message likes." on public.message_likes
  for select using (true);

create policy "Users can manage own likes." on public.message_likes
  for all using (auth.uid() = user_id);

-- Create policies for products (public read)
create policy "Anyone can view products." on public.products
  for select using (is_active = true);

-- Create policies for live_streams
create policy "Anyone can view live streams." on public.live_streams
  for select using (true);

-- Create policies for chat_messages
create policy "Anyone can view chat messages." on public.chat_messages
  for select using (true);

create policy "Users can insert own chat messages." on public.chat_messages
  for insert with check (auth.uid() = user_id);

-- Create policies for user_favorites
create policy "Users can view own favorites." on public.user_favorites
  for select using (auth.uid() = user_id);

create policy "Users can manage own favorites." on public.user_favorites
  for all using (auth.uid() = user_id);

-- Create policies for theatre_events
create policy "Anyone can view listed theatre events." on public.theatre_events
  for select using (visibility = 'listed');

create policy "Event creators can manage their events." on public.theatre_events
  for all using (auth.uid() = created_by);

-- Create policies for tickets
create policy "Users can view own tickets." on public.tickets
  for select using (auth.uid() = user_id);

create policy "Users can insert own tickets." on public.tickets
  for insert with check (auth.uid() = user_id);

-- Create policies for theatre_chat_messages
create policy "Anyone can view theatre chat messages." on public.theatre_chat_messages
  for select using (true);

create policy "Users can insert theatre chat messages." on public.theatre_chat_messages
  for insert with check (auth.uid() = user_id);

create policy "Users can update own theatre chat messages." on public.theatre_chat_messages
  for update using (auth.uid() = user_id);

-- Create policies for theatre_chat_reactions
create policy "Anyone can view theatre chat reactions." on public.theatre_chat_reactions
  for select using (true);

create policy "Users can manage own theatre chat reactions." on public.theatre_chat_reactions
  for all using (auth.uid() = user_id);

-- Create policies for theatre_bans
create policy "Users can view theatre bans." on public.theatre_bans
  for select using (true);

create policy "Moderators can manage theatre bans." on public.theatre_bans
  for all using (auth.uid() = banned_by);

-- Create policies for theatre_moderation_actions
create policy "Moderators can view moderation actions." on public.theatre_moderation_actions
  for select using (auth.uid() = moderator_id);

create policy "Moderators can insert moderation actions." on public.theatre_moderation_actions
  for insert with check (auth.uid() = moderator_id);

-- Create policies for guest_usernames
create policy "Anyone can view guest usernames." on public.guest_usernames
  for select using (true);

create policy "Anyone can insert guest usernames." on public.guest_usernames
  for insert with check (true);

-- Create functions and triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.products
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.orders
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.community_messages
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.live_streams
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.theatre_events
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.tickets
  for each row execute procedure public.handle_updated_at();

-- Create function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, opted_in_promotions)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'opted_in_promotions', 'false')::boolean);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile when user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert some sample data
insert into public.products (name, description, price, type, artist, genre) values
  ('Neon Dreams', 'A synthwave journey through cyber cities', 24.99, 'vinyl', 'Synthwave Collective', 'Synthwave'),
  ('Digital Horizons', 'Future bass meets retro aesthetics', 19.99, 'cd', 'Cyber Phoenix', 'Electronic'),
  ('Quantum Beats', 'Experimental electronic soundscapes', 12.99, 'digital', 'Future Bass', 'Future Bass'),
  ('Retro Wave', 'Classic 80s inspired synthwave', 29.99, 'vinyl', 'Nostalgic Nights', 'Retrowave');

-- Insert sample theatre events for Venue 5
insert into public.theatre_events (event_id, title, subtitle, description_md, start_at_iso, end_at_iso, visibility, age_restriction, tags, poster_image_url, access_mode, max_capacity) values
  ('fd-theatre-0001', 'ZENO RELOADED Live', 'Immersive Concert Stream', 'Join us for an interdimensional music experience featuring the legendary ZENO RELOADED in a never-before-seen virtual performance.', '2025-12-13T01:00:00Z', '2025-12-13T02:30:00Z', 'listed', '13+', ARRAY['concert', 'hip-hop', 'fifth-dimension'], 'https://images.unsplash.com/photo-1571266028243-d220bc560fdd?w=600&h=400&fit=crop', 'ticket_required', 5000),
  ('fd-theatre-0002', 'Vegas Nights: Casino Culture Deep Dive', 'Interactive Documentary', 'Exploring the glittering world of casino culture with live Q&A and behind-the-scenes footage.', '2025-12-15T20:00:00Z', '2025-12-15T21:30:00Z', 'listed', '18+', ARRAY['documentary', 'casino', 'culture'], 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&h=400&fit=crop', 'public_free', 3000),
  ('fd-theatre-0003', 'Neon Dreams: Synthwave Showcase', 'Live Electronic Performance', 'A journey through cyber cities with the best synthwave artists from around the digital realm.', '2025-12-20T19:00:00Z', '2025-12-20T21:00:00Z', 'listed', 'all', ARRAY['synthwave', 'electronic', 'cyberpunk'], 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop', 'ticket_required', 2500);

-- Create indexes for better performance
create index idx_profiles_username on public.profiles(username);
create index idx_products_artist on public.products(artist);
create index idx_products_genre on public.products(genre);
create index idx_arcade_scores_game_score on public.arcade_scores(game_name, score desc);
create index idx_community_messages_created_at on public.community_messages(created_at desc);
create index idx_chat_messages_stream_created on public.chat_messages(stream_id, created_at desc);
create index idx_theatre_events_event_id on public.theatre_events(event_id);
create index idx_theatre_events_start_at on public.theatre_events(start_at_iso);
create index idx_tickets_user_id on public.tickets(user_id);
create index idx_tickets_event_id on public.tickets(event_id);
create index idx_tickets_ticket_id on public.tickets(ticket_id);
create index idx_theatre_chat_messages_event_created on public.theatre_chat_messages(event_id, created_at desc);
create index idx_theatre_chat_messages_parent on public.theatre_chat_messages(parent_message_id);
create index idx_theatre_bans_user_event on public.theatre_bans(user_id, event_id);
create index idx_guest_usernames_username on public.guest_usernames(username);
create index idx_guest_usernames_expires on public.guest_usernames(expires_at);

-- Enable real-time for tables that need it
alter publication supabase_realtime add table public.community_messages;
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.arcade_scores;
alter publication supabase_realtime add table public.live_streams;
alter publication supabase_realtime add table public.theatre_events;
alter publication supabase_realtime add table public.theatre_chat_messages;
alter publication supabase_realtime add table public.theatre_chat_reactions;
alter publication supabase_realtime add table public.tickets;