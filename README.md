# Movie Torrent Finder

Search any movie and get direct magnet links in all available qualities (4K, 1080p, 720p, 480p).

## Setup

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev
```

Open http://localhost:5173 in your browser.

## Requirements
- Node.js v18+
- A torrent client (qBittorrent, Transmission, etc.) to handle magnet links

## Sources
- **YTS** — primary source with movie metadata and posters
- **1337x** — fallback for movies not on YTS
