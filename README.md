# Lab POROS 2026

Interactive web training labs for CTF workshop practice. Lightweight, modular, and Docker-based.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  docker compose                      │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │   HOME   │  │   LFI    │  │   SQLi   │           │
│  │  nginx   │  │   PHP    │  │ PHP+SQL  │           │
│  │  :80     │  │  :6001   │  │  :6002   │           │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                      │
│  ┌──────────┐  ┌──────────┐                          │
│  │   JWT    │  │   CMDi   │                          │
│  │ Express  │  │  Flask   │                          │
│  │  :6004   │  │  :6005   │                          │
│  └──────────┘  └──────────┘                          │
│                                                      │
│  ┌─────────────────┐                                 │
│  │ Path Traversal  │                                 │
│  │     Express     │                                 │
│  │     :6006       │                                 │
│  └─────────────────┘                                 │
│                                                      │
│  ──────────── lab-network (bridge) ────────────      │
└─────────────────────────────────────────────────────┘
```

| Service | Stack | Port | Description |
|---------|-------|------|-------------|
| Home | nginx:alpine | 80 | Dashboard with links to all labs |
| LFI | PHP 8.2 Alpine | 6001 | File inclusion lab |
| SQLi | PHP 8.2 + SQLite | 6002 | SQL injection login bypass |
| JWT | Node.js Express | 6004 | Token authentication lab |
| CMDi | Flask + SQLite | 6005 | Command injection in network toolkit |
| Path Traversal | Node.js Express | 6006 | File path traversal in document viewer |

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/downloads)

### Clone & Run

```bash
git clone https://github.com/poros-security/ignite.git
cd ignite
docker compose up -d
```

### Access

Open your browser:

- **Dashboard:** http://localhost
- **LFI Lab:** http://localhost:6001
- **SQLi Lab:** http://localhost:6002
- **JWT Lab:** http://localhost:6004
- **CMDi Lab:** http://localhost:6005
- **Path Traversal Lab:** http://localhost:6006

### Stop

```bash
docker compose down
```

## Change Flags

Flags are set via environment variables in `docker-compose.yml`. To customize:

1. Open `docker-compose.yml`
2. Find the `environment` section for each service
3. Change the `FLAG` value:
   ```yaml
   environment:
     - FLAG=ignite{your_custom_flag_here}
   ```
4. Restart the containers:
   ```bash
   docker compose down && docker compose up -d
   ```

## Add a New Lab Module

1. Create a new folder: `mkdir newlab`
2. Inside, create:
   - `Dockerfile` — container build instructions
   - App source code (PHP, Node.js, Python, etc.)
   - `.env.example` — document required env vars
   - `README.md` — lab description, hints, and learning outcomes
3. Add the service to `docker-compose.yml`:
   ```yaml
   newlab:
     build: ./newlab
     container_name: lab-newlab
     ports:
       - "6005:80"
     environment:
       - FLAG=ignite{new_flag_here}
     restart: unless-stopped
     networks:
       - lab-network
   ```
4. Add a card to `home/index.html`
5. Run `docker compose up -d --build`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port conflict on 80 | Change the host port in `docker-compose.yml`: `"8080:80"` |
| Container won't start | Check logs: `docker compose logs <service>` |
| Build fails | Ensure Docker is running and try `docker compose build --no-cache` |
| Old data persists | Run `docker compose down -v` to remove volumes |
| Permission issues | Ensure Docker has proper permissions on your OS |

## Lab Guides

Each lab has its own `README.md` with:
- Description of the challenge
- Step-by-step instructions
- Hints (without full solutions)
- Expected learning outcomes

See: [`lfi/README.md`](lfi/README.md) · [`sqli/README.md`](sqli/README.md) · [`jwt/README.md`](jwt/README.md) · [`cmdi-flask/README.md`](cmdi-flask/README.md) · [`traversal-express/README.md`](traversal-express/README.md)
