# Rating Engine

OpenSkill-based rating calculation service for the Riichi Mahjong League.

## Development

```bash
# Install dependencies with uv
uv sync

# Run development server
npm run dev

# Run tests
npm run test

# Lint and format
npm run lint
npm run format
```

## API Endpoints

- `GET /` - Root endpoint with service info
- `GET /health` - Health check
- `POST /calculate-ratings` - Calculate ratings for a set of games (coming soon)
