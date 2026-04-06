# Reverberate — project brief

This file captures the product and stack goals for **Reverberate** (personal Spotify-like MERN app).

## Stack (summary)

- **Client:** React (Vite), TailwindCSS, Axios, React Router v6, Zustand, Howler.js, YouTube IFrame API
- **Server:** Node.js, Express, JWT + Bcrypt, Multer, Cloudinary, YouTube Data API v3
- **DB:** MongoDB Atlas + Mongoose

## Core feature order

1. Auth (register, login, JWT, protected routes)
2. Landing page
3. Dashboard + recommendations
4. YouTube search + stream
5. Persistent player (prev/next/shuffle/repeat/volume)
6. Playlists
7. MP3 upload (Cloudinary)
8. Listening history
9. Recommendations (history + trending)
10. Artist follow
11. Responsive layout
12. Dark default + optional light mode

## Design

- **Primary:** `#0a0a0a` · **Accent:** `#7c3aed` · **Fonts:** Clash Display + Satoshi (to be wired)

## Env templates

Copy `server/.env.example` → `server/.env` and `client/.env.example` → `client/.env`, then fill in Atlas, JWT, Cloudinary, and YouTube keys.

For the full original brief (folder tree, schemas, API env list), refer to the repository README and your course / planning docs.
