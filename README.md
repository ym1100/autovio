# AutoVio

AI video generation pipeline for automating video creation. Generate videos from text prompts using LLMs, image generation models, and video synthesis APIs. Built for developers, content creators, and SaaS platforms.

## What is AutoVio?

AutoVio is an open-source text-to-video pipeline that connects multiple AI providers (Google Gemini, OpenAI, Anthropic Claude) to automate video production. It handles the full workflow: scenario writing, image generation, image-to-video conversion, and timeline editing.

## Features

- **Text to video generation** - Create videos from text descriptions
- **AI video editing** - Automated scene composition with overlays
- **Reference video analysis** - Analyze existing videos with vision AI to replicate styles
- **Scene-by-scene scenario generation** - LLM-powered scriptwriting
- **AI image generation** - Generate visuals for each scene (Gemini, DALL-E, etc.)
- **Image to video conversion** - Convert images to video clips (Veo, Runway, etc.)
- **Video timeline editor** - Add text overlays, image overlays, transitions
- **Template system** - Reusable overlay compositions for branding
- **Multi-provider support** - Gemini, OpenAI, Claude, and more
- **REST API** - Full OpenAPI documentation for integration
- **MCP server** - Model Context Protocol support for AI assistants

## Use Cases

### AI Coding Assistants

Integrate with AI coding tools to generate demo videos automatically:

- **Claude Code** - Generate product demo videos after implementing features
- **Cursor** - Create tutorial videos for code changes
- **OpenCode** - Automate video documentation for releases
- **Aider** - Build video content alongside code

### Workflow Automation

Connect to automation platforms for scheduled video generation:

- **n8n** - Trigger video creation from webhooks, forms, or schedules
- **Make (Integromat)** - Build video pipelines with drag-and-drop
- **Zapier** - Connect to 5000+ apps for automated video workflows

### Mobile & Remote Access

Use MCP-compatible apps for video generation on the go:

- **OpenClaw** - Generate videos from your phone
- **Claude Desktop** - Create videos through conversation

### SaaS & Product Teams

- Generate product update videos automatically
- Create onboarding videos from documentation
- Build marketing videos from feature specs
- Automate social media video content

## Requirements

- [Bun](https://bun.sh/) >= 1.0
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- Node.js >= 18 (for some dependencies)
- API keys for AI providers (Gemini, OpenAI, etc.)

## Installation

### Using Bun (recommended)

```bash
git clone <repository-url>
cd AutoVio
bun install
```

### Using Docker

> Coming soon

## Configuration

Copy the example environment file and edit it:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `PORT` | Backend port (default: 3001) |

Optional MongoDB credentials (if not using connection string auth):

| Variable | Description |
|----------|-------------|
| `MONGODB_USERNAME` | Database username |
| `MONGODB_PASSWORD` | Database password |
| `MONGODB_DB_NAME` | Database name (default: autovio) |

## Running

Start both backend and frontend:

```bash
bun run dev
```

- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:5173`

Run separately:

```bash
bun run dev:backend   # backend only
bun run dev:frontend  # frontend only
```

## API

OpenAPI documentation is available at `/api/docs` when the backend is running.

Key endpoints:

- `POST /api/scenario` - Generate video scenario with LLM
- `POST /api/generate/image` - Generate images from prompts
- `POST /api/generate/video` - Convert images to video
- `POST /api/analyze` - Analyze reference videos

## Project Structure

```
AutoVio/
├── packages/
│   ├── backend/    # Express API server
│   ├── frontend/   # React + Vite app
│   └── shared/     # Shared types and utilities
└── package.json    # Workspace root
```

## MCP Server

An MCP (Model Context Protocol) server is available in the `AutoVio-MCP` directory for integration with:

- Claude Desktop
- Cursor IDE
- OpenClaw
- Any MCP-compatible client

See `AutoVio-MCP/README.md` for setup instructions.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development servers |
| `bun run build` | Build all packages |
| `bun run typecheck` | Run TypeScript type checking |


## License

This project is licensed under [Polyform Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

You can use, modify, and run this software for personal, educational, or non-commercial purposes. Commercial use requires a separate license agreement.

For commercial licensing inquiries, please contact the maintainers.
