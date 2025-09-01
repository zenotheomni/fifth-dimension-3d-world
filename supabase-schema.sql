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

-- Create chat_messages table for live stream chat
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

-- Create indexes for better performance
create index idx_profiles_username on public.profiles(username);
create index idx_products_artist on public.products(artist);
create index idx_products_genre on public.products(genre);
create index idx_arcade_scores_game_score on public.arcade_scores(game_name, score desc);
create index idx_community_messages_created_at on public.community_messages(created_at desc);
create index idx_chat_messages_stream_created on public.chat_messages(stream_id, created_at desc);

-- Enable real-time for tables that need it
alter publication supabase_realtime add table public.community_messages;
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.arcade_scores;
alter publication supabase_realtime add table public.live_streams;