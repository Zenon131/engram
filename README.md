# Bulletin

A simple, anonymous social bulletin board where users can post thoughts to shared feeds (clusters/topics), with upvotes and downvotes.

## Features

- Create posts with title, content, and cluster/category
- View posts from the community
- Upvote and downvote posts
- Filter posts by cluster/category
- Real-time updates with Supabase

## Technology Stack

- SvelteKit
- TailwindCSS
- Supabase (for database and authentication)

## Setup

### Prerequisites

- Node.js
- npm or pnpm
- Supabase account

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd engram
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:

   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_KEY=your-supabase-anon-key
   ```

4. Set up Supabase
   - Create a new project in Supabase
   - Use the SQL in `supabase-setup.sql` to create the necessary tables and policies
   - Update the environment variables with your Supabase project URL and public anon key
   - No authentication is required, the app uses device IDs stored in localStorage

5. Run the development server

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## Database Schema

### Engrams Table

- `id`: BIGINT (Primary Key)
- `title`: TEXT
- `content`: TEXT
- `device_id`: TEXT (Anonymous identifier)
- `cluster`: TEXT
- `upvotes`: INTEGER
- `downvotes`: INTEGER
- `created_at`: TIMESTAMP WITH TIME ZONE

### Votes Table

- `id`: BIGINT (Primary Key)
- `engram_id`: BIGINT (References engrams)
- `device_id`: TEXT (Anonymous identifier)
- `vote_type`: TEXT ('up' or 'down')
- `created_at`: TIMESTAMP WITH TIME ZONE

## Anonymous Usage

The app is completely anonymous with no authentication required:
- Anyone can create, view, update, and delete posts
- All users can vote (using a device ID stored in localStorage)
- Each device can only vote once per engram
- Row Level Security (RLS) is set up to allow full anonymous access
