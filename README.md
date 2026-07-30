# ⚡ Road to Doomsday

**Road to Doomsday** is a massive, highly-interactive, neo-brutalist Marvel Cinematic Universe (MCU) timeline tracker built to help you and a partner sync up and prepare for the release of *Avengers: Doomsday* (May 2026).

With an unapologetically bold UI inspired by brutalism—featuring stark contrasts, sharp borders, and heavy typography—this app allows users to track their progress through both the overarching "Movie Road" and the street-level/multiversal "Series Road".

## 🚀 Key Features

- **Neo-Brutalist Design System:** A massive, punchy visual style featuring sharp black borders, solid block colors (`neo-yellow`, `neo-red`, `neo-blue`, `neo-green`), deep box-shadows, and heavy typography.
- **Dual Timelines:** Side-by-side (and horizontally scrollable on mobile) timeline tracking for both Movies and Series.
- **Partner Sync:** Built-in real-time synchronization via Supabase. Link your account with a partner to see exactly where they are on their MCU watch journey.
- **Dynamic Filtering:** 
  - Toggle between **Chronological** and **Release** Order.
  - Switch between **100% Completionist** and **Doomsday Essentials** scopes to filter out non-critical multiversal fat.
- **Avengers: Doomsday Countdown:** A live countdown timer anchoring the bottom of the timeline counting exactly down to the theatrical release of *Avengers: Doomsday*.
- **Responsive Panning:** A sleek, side-by-side horizontal scrolling layout tailored for mobile devices to keep the massive MCU tree manageable.

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Custom Neo-Brutalist Design Tokens)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security)
- **Animations:** Framer Motion (Micro-interactions and timeline scroll tracking)
- **Icons:** Lucide-React
- **State Management:** React Hooks & Supabase Realtime Subscriptions

## 📦 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
You will also need a [Supabase](https://supabase.com) project configured with the correct `profiles` and `user_progress` schemas.

### 2. Installation
Clone the repository and install the required dependencies:

```bash
git clone https://github.com/roi-thhh/road-to-doomsday.git
cd road-to-doomsday
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase connection strings:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Running the Application
Fire up the local development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📝 Database Schema

The app relies on a Supabase database with the following core tables:
- `profiles`: Stores user data and their linked `partner_id`.
- `user_progress`: Maps a `user_id` to an `mcu_id` and their `status` (watched, watching, etc.).

## 🎨 Design Philosophy

"Road to Doomsday" throws out the traditional sleek, glassy modern web design in favor of **Neo-Brutalism**. Why? Because preparing for a multiversal collapse caused by Doctor Doom shouldn't feel polite. It should feel huge, urgent, and comic-book loud.

## 🤝 Created By

**Rohith Das**  
[Follow on Instagram](https://www.instagram.com/roith.hhh?igsh=MWdmNHk2NXpmNjZ6Mg==)
