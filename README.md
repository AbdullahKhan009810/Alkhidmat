# Muawin (معاون) — Voice-Powered Welfare Assistant

**Organization:** Al Khidmat Foundation Pakistan  
**Languages:** English & Urdu (اردو)  
**Stack:** Next.js 14 · TypeScript · Prisma · Supabase · Tailwind CSS

Muawin (Arabic/Urdu for "Helper") is a bilingual voice-powered welfare assistance platform built for [Al Khidmat Foundation](https://alkhidmat.org), a Pakistani humanitarian organization. It provides a phone-call-style interface where citizens speak in English or Urdu and receive spoken answers about Al Khidmat's free welfare services — hospitals, medical camps, free treatment eligibility, and ambulance/transport guidance.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [AI Pipeline](#ai-pipeline)
- [RAG Knowledge Base](#rag-knowledge-base)
- [Embedding System](#embedding-system)
- [TTS Voice Routing](#tts-voice-routing)
- [Client-Side Pipeline](#client-side-pipeline)
- [Admin Dashboard](#admin-dashboard)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Scripts](#scripts)
- [Deployment](#deployment)

---

## Features

### Public Voice Assistant
- **Phone-call-style UI** — Start/End call button, mute toggle, live status indicator, and sound-wave icon
- **Bilingual support** — Full English and Urdu with RTL layout switching via a language toggle
- **Live transcript panel** — Real-time chat-style transcript displayed alongside the call panel
- **Streaming responses** — Bot answers stream token-by-token; complete sentences are spoken as they arrive
- **Conversation persistence** — All conversations are saved to PostgreSQL with unique session IDs

### AI & Voice
- **Speech recognition** — Browser-native STT (Chrome/Edge) with auto-restart during active calls
- **RAG-grounded answers** — Every factual answer is retrieved from a curated knowledge base; the LLM never invents information
- **Language-based TTS routing:**
  - **Urdu** → Uplift AI (broadband-support, male voice, native Urdu pronunciation)
  - **English** → ElevenLabs Flash v2.5 (Eman voice, female)
- **Gendered personas:**
  - Urdu mode: **Muawin** (معاون) — male operator, masculine Urdu grammar (کرتا ہوں، بتاتا ہوں)
  - English mode: **Fatima** — female operator, warm feminine phrasing
- **Audio caching** — In-memory cache for repeated TTS phrases (greetings, closings); cache hits return in ~10-60ms
- **Instant small talk** — Greetings, identity questions, and closings answered without LLM or RAG (fixed phrasing, hits TTS cache)
- **Pre-warm** — Embedding API and TTS engine are warmed on page load to eliminate cold-start latency

### Admin Dashboard
- **Conversation viewer** — Browse all conversations with session IDs, transcript previews, language, and message counts
- **Knowledge base manager** — CRUD for bilingual entries across 3 welfare use cases, with PDF upload to Supabase Storage
- **PDF text extraction** — Upload a PDF and automatically extract its text content into the knowledge base entry
- **Protected routes** — Supabase Auth cookie-based sessions with Next.js middleware enforcement

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      BROWSER (Next.js UI)                     │
│                                                              │
│  ┌────────────┐   ┌───────────────┐   ┌──────────────────┐  │
│  │ Call Panel │   │ Mic Capture   │   │ Transcript Panel │  │
│  │ (orb/mute) │   │ (Web Speech   │   │ (en/ur, RTL)     │  │
│  └─────┬──────┘   │  API)         │   └────────▲─────────┘  │
│        │          └──────┬────────┘            │ text       │
└────────┼─────────────────┼─────────────────────┼────────────┘
         │                 │ speech              │
         │                 ▼                     │
┌────────┼───────────────────────────────────────┼────────────┐
│        │         NEXT.JS SERVER                │            │
│        │                                       │            │
│  ┌─────▼─────────────┐   ┌────────────────┐   │            │
│  │ /api/chat (Qwen)  │   │ /api/rag/query │   │            │
│  │ • Brain / LLM     │◄──┤ • Embed query  │   │            │
│  │ • Grounded Q&A    │   │ • Local JSON   │   │            │
│  │ • Small talk      │   │ • Upstash fall │   │            │
│  └─────┬─────────────┘   └────────────────┘   │            │
│        │ text answer                          │            │
│  ┌─────▼─────────────────────────────────────┐│            │
│  │ /api/tts                                  ││            │
│  │ Urdu → Uplift AI (male)                   ││            │
│  │ English → ElevenLabs Eman (female)        ││            │
│  │ + In-memory audio cache                   │┘            │
│  └───────────────────────────────────────────┘             │
│                                                            │
│  ┌───────────────────────────────────────────┐             │
│  │ /api/conversations (save transcripts)     │             │
│  │ /api/knowledge-base (admin CRUD)          │             │
│  │ /api/upload (PDF → Supabase Storage)      │             │
│  └───────────────────────────────────────────┘             │
└────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL (via Supabase) |
| **ORM** | Prisma 6 |
| **Auth** | Supabase Auth (cookie-based sessions) |
| **File Storage** | Supabase Storage (PDF documents) |
| **Brain / LLM** | Qwen (DashScope, OpenAI-compatible) |
| **Embeddings (primary)** | Qwen `text-embedding-v4` (1024-dim, API) |
| **Embeddings (fallback)** | `paraphrase-multilingual-MiniLM-L12-v2` (384-dim, ONNX, local) |
| **TTS — Urdu** | Uplift AI (broadband-support, native Urdu male voice) |
| **TTS — English** | ElevenLabs Flash v2.5 (Eman, female voice) |
| **Vector Store** | Local JSON index + Upstash Vector (backup) |
| **Icons** | Lucide React |
| **Deployment** | Vercel (recommended) |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (for database, auth, and storage)
- API keys for Qwen, Uplift AI, and ElevenLabs

### 1. Clone and install

```bash
git clone <repo-url>
cd Alkhidmat-main
npm install
```

### 2. Configure environment

Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) below for all required keys.

### 3. Set up the database

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:seed        # Seed sample data (optional)
```

Also apply the Row Level Security policies:
```bash
# Run prisma/rls-policies.sql in your Supabase SQL editor
```

### 4. Create Supabase Storage bucket

In your Supabase dashboard, create a storage bucket named **`knowledge-base`** (public, for PDF documents). The upload endpoint (`/api/upload`) writes to this bucket.

### 5. Build the RAG knowledge base

```bash
npm run kb:build       # Export KB from DB → embed → write local index
```

This runs `kb:export` (DB → JSON) and `kb:embed` (generate embeddings → `data/kb-index.json`).

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Environment Variables

```env
# ── Supabase ──
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ── Database (Prisma migrations) ──
DATABASE_URL="postgresql://postgres:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@host:5432/postgres"

# ── Brain / LLM — Qwen (DashScope) ──
QWEN_API_KEY="your-qwen-api-key"
QWEN_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
QWEN_CHAT_MODEL="qwen3-omni-flash"
QWEN_EMBEDDING_MODEL="text-embedding-v4"

# ── TTS — Uplift AI (Urdu, primary) ──
UPLIFTAI_API_KEY="your-upliftai-key"
UPLIFTAI_TTS_VOICE="broadband-support"
UPLIFTAI_TTS_FORMAT="MP3_22050_128"

# ── TTS — ElevenLabs (English, primary) ──
ELEVENLABS_API_KEY="your-elevenlabs-key"
ELEVENLABS_TTS_MODEL="eleven_flash_v2_5"
ELEVENLABS_TTS_VOICE_EN="aQLnnbQ6J7JYyvxnNgjx"

# ── RAG — local knowledge base ──
KB_DATA_DIR="./data/kb"
KB_INDEX_FILE="./data/kb-index.json"
EMBEDDING_MODEL="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

# ── RAG — Upstash Vector (backup, optional) ──
UPSTASH_VECTOR_URL="https://your-index.upstash.io"
UPSTASH_VECTOR_TOKEN="your-upstash-token"
```

---

## Project Structure

```
├── data/
│   ├── kb/                        # Knowledge base JSON files (by category)
│   │   ├── donations.json
│   │   ├── eligibility-check.json
│   │   ├── facility-finder.json
│   │   ├── hospitals.json
│   │   ├── medical-camps.json
│   │   ├── programs.json
│   │   └── transport-guidance.json
│   └── kb-index.json              # Embedded vector index (generated)
│
├── prisma/
│   ├── schema.prisma              # Database schema (User, Conversation, Message, KB)
│   ├── seed.ts                    # Main seed script
│   ├── seed-kb-comprehensive.ts   # Comprehensive KB seed data
│   └── rls-policies.sql           # Row-level security policies
│
├── scripts/
│   ├── embed-kb.ts                # Generate embeddings → kb-index.json
│   ├── export-kb.ts               # Export DB entries → data/kb/*.json
│   └── test-rag.ts                # Test RAG retrieval locally
│
├── src/
│   ├── app/
│   │   ├── page.tsx               # Public voice assistant (home)
│   │   ├── layout.tsx             # Root layout
│   │   ├── admin/                 # Admin dashboard & knowledge base
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── knowledge-base/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx           # Login page
│   │   └── api/
│   │       ├── chat/route.ts      # Brain: RAG-grounded Q&A + small talk
│   │       ├── tts/route.ts       # TTS: language-based routing + cache
│   │       ├── rag/query/route.ts # Standalone RAG retrieval
│   │       ├── warmup/route.ts    # Pre-warm embedding API + TTS
│   │       ├── conversations/     # CRUD for conversation persistence
│   │       ├── knowledge-base/    # Admin KB CRUD
│   │       ├── upload/route.ts    # PDF upload to Supabase Storage
│   │       └── admin/logout/      # Admin logout
│   │
│   ├── components/
│   │   ├── CallPanel.tsx          # Call UI (orb, start/end, mute, status)
│   │   ├── TranscriptPanel.tsx    # Live transcript display
│   │   ├── Header.tsx / Footer.tsx
│   │   ├── LanguageToggle.tsx     # EN/UR toggle with RTL support
│   │   └── ui/                    # Badge, Button, TextInput, Toast, ToggleSwitch
│   │
│   ├── lib/
│   │   ├── rag/                   # RAG pipeline
│   │   │   ├── retriever.ts       # Cosine search + Upstash fallback + alias expansion
│   │   │   ├── embedder.ts        # Dual-layer embeddings (API + local ONNX)
│   │   │   └── upstash.ts         # Upstash Vector client
│   │   ├── supabase/              # Supabase client (browser + server)
│   │   ├── constants.ts           # Brand names, hero text, language options
│   │   ├── translations.ts        # i18n strings for UI
│   │   └── prisma.ts              # Prisma client singleton
│   │
│   ├── types/index.ts             # TypeScript types
│   └── middleware.ts              # Auth middleware for /admin routes
│
└── package.json
```

---

## AI Pipeline

### Three-Tier Chat Routing

Every user message passes through three tiers before reaching the LLM:

1. **Tier 1 — Instant responses (no API calls):**
   - **Closings** — "Thank you" / "Goodbye" → warm farewell + helpline reminder
   - **Small talk** — Greetings, "who are you?", "how are you?" → fixed persona responses
   - These also hit the TTS audio cache for instant playback

2. **Tier 2 — RAG-grounded Q&A:**
   - If relevant knowledge chunks are found (cosine similarity above threshold), the LLM answers strictly from the retrieved context
   - System prompt enforces: no hallucination, no markdown, conversational tone, under 35 words

3. **Tier 3 — Conversational fallback:**
   - If no RAG chunks match, the LLM chats naturally but can never invent Al Khidmat facts
   - Out-of-scope specifics → helpline fallback message

### Query Flow

```
User message → Closing check → Small talk check → RAG retrieval → LLM (grounded or conversational)
```

### Conversation History

The last **8 turns** of conversation history are sent to the LLM with each request. This enables:
- Follow-up questions ("and in Rawalpindi?", "what about the second one?")
- Contextual continuity across a call session
- History is strictly validated on the server — only `user`/`assistant` roles, max 2000 chars per message

### SSE Streaming Format

The `/api/chat` endpoint supports Server-Sent Events (SSE) when `stream: true` is sent in the request body. Three event types are emitted:

```
data: {"type": "token", "token": "راولپنڈی میں تین ہسپتال ہیں"}   ← text chunk
data: {"type": "sources", "sources": [...]}                         ← retrieved KB chunks with scores
data: {"type": "done"}                                              ← stream complete
```

The client buffers incoming tokens and flushes complete sentences (delimited by `.`, `!`, `?`, `۔`, `؟`) to the TTS engine for sequential playback.

---

## RAG Knowledge Base

### Three Core Use Cases

| # | Use Case | Category Key | Description |
|---|---|---|---|
| 1 | Facility Finder | `facility-finder` | Locate hospitals, clinics, medical camps |
| 2 | Eligibility Check | `eligibility-check` | Free service criteria and application process |
| 3 | Transport Guidance | `transport-guidance` | Ambulance services and patient transport |

> Additional KB files exist for `donations`, `hospitals`, `medical-camps`, and `programs` — these provide supplementary context that the RAG retriever can search across all categories.

### Embedding Pipeline (Build Time)

1. Knowledge JSON files are read from `data/kb/`
2. Long content is chunked (~400 chars, sentence-aware splitting)
3. Each chunk is embedded — either via Qwen API (1024-dim) or local ONNX (384-dim), depending on the `EMBEDDING_MODEL` config
4. Output: `data/kb-index.json` — `{ id, text, metadata, vector[] }` records
5. Vectors are also synced to Upstash Vector as a cloud backup

> **Note:** The index must be built with the same embedding model used at query time. The retriever auto-detects the vector dimensions and selects the matching query embedding layer.

### Query-Time Retrieval

1. **Alias expansion** — Common slang/abbreviations are normalized before embedding (e.g. "Pindi" → "Rawalpindi راولپنڈی", "Bano" → "Bano Qabil بنو قابل", city names across Pakistan)
2. **Embed the query** — Using the matching embedding layer (API or local, based on index dimensions)
3. **Cosine similarity search** — Against the local JSON index (default top-6, score threshold **0.28**)
4. **Fallback** — Upstash Vector if local index is unavailable
5. **Inject** — Retrieved chunks are formatted and injected into the LLM system prompt as `[Source N] (category, language) text`

### Cross-Lingual Support

The embedding model handles English ↔ Urdu cross-lingual matching — a user can ask in Urdu and retrieve relevant English content (and vice versa).

---

## Embedding System

The embedding layer has **two tiers** with automatic fallback:

| Tier | Model | Dimensions | Speed | Role |
|---|---|---|---|---|
| **Primary** | Qwen `text-embedding-v4` (DashScope API) | 1024-dim | ~165ms warm | Production embeddings |
| **Fallback** | `paraphrase-multilingual-MiniLM-L12-v2` (ONNX, local) | 384-dim | First load ~2s, then cached | Offline / API failure |

### Key details

- **Dimension compatibility** — The KB index must be built with the same model used at query time. The retriever checks the index vector dimensions and automatically selects the matching embedding layer (`embedTextFor(dims)`).
- **LRU query cache** — 200-entry in-memory cache for embeddings. Repeated or similar queries return instantly (0ms).
- **Request deduplication** — Concurrent identical embedding requests are deduplicated (only one API call per unique text).
- **Pre-warm** — `GET /api/warmup` is called fire-and-forget on page load to warm the API connection, so the first real query is fast.
- **Index invalidation** — The local JSON index is cached in memory and automatically reloaded when the file's modification time changes.

---

## TTS Voice Routing

Language-based routing with cross-fallback:

| Language | Primary Engine | Voice | Gender | Persona |
|---|---|---|---|---|
| **Urdu** | Uplift AI | broadband-support | Male | Muawin (معاون) |
| **English** | ElevenLabs Flash v2.5 | Eman (`aQLnnbQ6J7JYyvxnNgjx`) | Female | Fatima |

**Fallback:** If the primary engine fails, the system tries the other engine.

**Audio cache:** In-memory LRU cache (50 entries, 1-hour TTL). Greeting and small-talk phrases are pre-generated on page load for instant playback.

**Text preprocessing:** Before TTS, the system handles:
- Acronyms (CNIC → "C N I C", ICU → "I C U", etc.)
- Phone numbers (051-4853951 → digit-by-digit)
- Urdu-specific substitutions (24/7 → چوبیس گھنٹے, Dr. → ڈاکٹر)
- English-specific substitutions (24/7 → "twenty-four seven", Dr. → "Doctor")

---

## Client-Side Pipeline

### Speech Recognition
- Uses the **Web Speech API** (`SpeechRecognition`) — requires **Chrome or Edge**
- Configured for `ur-PK` (Urdu) or `en-US` (English) based on the language toggle
- **Auto-restarts** after silence timeouts while the call is active
- **Barge-in** — All user speech is ignored while the bot is speaking (prevents echo)
- Shows a toast error if the browser doesn't support the Web Speech API

### Sentence-Level Streaming
Instead of waiting for the full bot response, the client:
1. Buffers incoming SSE tokens into `fullAnswer` and `unspokenBuffer`
2. Detects sentence boundaries (`.`, `!`, `?`, `۔`, `؟`) in the buffer
3. Flushes complete sentences to the TTS engine immediately
4. After the stream ends, speaks any remaining text

This means the user hears the first sentence within ~1-2 seconds of the bot starting to generate.

### Audio Queue
- Sentences are queued in `audioQueueRef` and played **sequentially** by `playNextAudio()`
- A **generation counter** (`audioGenerationRef`) ensures that when the user ends the call, all pending/in-flight TTS requests are cancelled (stale audio is never played)
- Each audio blob URL is revoked after playback to free memory

### Urdu Text Normalization
Two layers of post-processing fix common LLM misspellings in Urdu output:

**Server-side** (`normalizeUrduAnswer` in `chat/route.ts`):
- الکھدمت → الخدمت (fixes misspelling of Al Khidmat)
- کھدمت → خدمت
- مبین → معاون (fixes name hallucination — "Moin" → "Muawin")

**Client-side** (`normalizeUrdu` in `page.tsx`):
- Same replacements applied to the transcript display and TTS input

### Conversation Auto-Save
When the user ends a call, the full conversation (all user + bot messages) is automatically saved to the PostgreSQL database via `POST /api/conversations` with a unique session ID (e.g. `TR-LX5A2B`). The admin dashboard can then display it.

### Greeting Pre-Cache
On page load (and on language switch), the app:
1. Fires `GET /api/warmup` to pre-warm the embedding API
2. Pre-generates the greeting audio for the current language via `POST /api/tts`
3. Stores the audio blob URL in `greetingCacheRef`

When the user clicks "Start Call", the greeting plays **instantly** from cache — no TTS latency.

---

## Admin Dashboard

Accessible at `/admin` (protected by Supabase Auth middleware):

**Auth flow:**
- `/admin` (login page) is public — no auth required
- All other `/admin/*` routes are protected by `middleware.ts` which checks the Supabase Auth session via cookies
- Unauthenticated users are redirected to the login page
- API routes for conversations and knowledge base also enforce Supabase Auth server-side

- **Dashboard** (`/admin/dashboard`) — Total conversation count, latest transcript preview, full conversations table with detail modal (chat-bubble formatting, RTL-aware)
- **Knowledge Base** (`/admin/knowledge-base`) — Filter by use case, search entries (title EN/UR, ID), upload PDFs, view bilingual content (Urdu RTL / English LTR), toggle active/inactive status, entry detail modal with full content

### PDF Upload Flow

1. Admin selects a PDF (max 10MB) in the upload modal
2. `POST /api/upload` receives the file, validates type (PDF only) and size
3. **Text extraction** — `pdf-parse` extracts all text from the PDF automatically
4. **Storage upload** — File is uploaded to Supabase Storage bucket `knowledge-base/` with a unique timestamped path
5. **Response** — Returns `{ url, fileName, path, extractedText }` — the admin UI auto-fills the KB entry's text content from `extractedText`
6. If PDF text extraction fails (e.g. scanned image), the file is still uploaded — just without extracted text

---

## Database Schema

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│     User     │       │   Conversation   │       │       Message        │
├──────────────┤       ├──────────────────┤       ├──────────────────────┤
│ id (PK)      │───┐   │ id (PK)          │───┐   │ id (PK)              │
│ email        │   └──<│ userId (FK)      │   └──<│ conversationId (FK)  │
│ name         │       │ sessionId        │       │ role (user/bot)      │
│ role         │       │ language (en/ur) │       │ content              │
│ createdAt    │       │ status           │       │ timestamp            │
└──────────────┘       └──────────────────┘       └──────────────────────┘

┌────────────────────────────┐
│    KnowledgeBaseEntry      │
├────────────────────────────┤
│ id (PK)                    │
│ title / titleUr            │
│ category                   │
│ language (en/ur/both)      │
│ status (active/inactive)   │
│ contentEn / contentUr      │
│ fileUrl / fileName         │
└────────────────────────────┘
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/chat` | Public | RAG-grounded Q&A with streaming SSE support |
| POST | `/api/tts` | Public | Text-to-speech with language-based routing |
| POST | `/api/rag/query` | Public | Standalone RAG retrieval (embed + search) |
| POST | `/api/warmup` | Public | Pre-warm embedding API and TTS engine |
| GET | `/api/conversations` | Required | List all conversations with messages |
| POST | `/api/conversations` | Public | Save a new conversation |
| GET | `/api/conversations/[id]` | Required | Get a single conversation by ID |
| GET | `/api/knowledge-base` | Required | List/search KB entries |
| POST | `/api/knowledge-base` | Required | Create a new KB entry |
| GET/DELETE | `/api/knowledge-base/[id]` | Required | Get or delete a KB entry |
| POST | `/api/upload` | Public | Upload PDF to Supabase Storage |
| POST | `/api/admin/logout` | — | Log out admin user |

### Request/Response Formats

**`POST /api/chat`** — Brain endpoint:
```json
// Request
{ "message": "string", "language": "en" | "ur", "stream": true, "history": [{ "role": "user" | "assistant", "content": "string" }], "category": "string?" }

// SSE Response (when stream: true)
data: {"type": "token", "token": "text chunk"}
data: {"type": "sources", "sources": [{"id", "category", "title", "score", "source"}]}
data: {"type": "done"}

// JSON Response (when stream: false)
{ "answer": "string", "sources": [...], "fallback": boolean }
```

**`POST /api/tts`** — Text-to-speech:
```json
// Request
{ "text": "string", "language": "en" | "ur" }
// Response: Raw audio bytes (audio/mpeg or audio/wav)
```

**`POST /api/rag/query`** — Standalone retrieval:
```json
// Request
{ "query": "string", "category": "string?", "topK": number? }
// Response
{ "query": "string", "count": number, "results": [{"id", "category", "title", "text", "score", "source"}] }
```

**`POST /api/upload`** — PDF upload (multipart form-data):
```
// Request: FormData with "file" field (PDF, max 10MB)
// Response
{ "url": "string", "fileName": "string", "path": "string", "extractedText": "string" }
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema to database (dev) |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run kb:export` | Export DB knowledge base entries → `data/kb/*.json` |
| `npm run kb:embed` | Generate embeddings → `data/kb-index.json` |
| `npm run kb:build` | Full KB pipeline: export + embed |

---

## Deployment

The recommended deployment target is **Vercel**:

```bash
npm run build
vercel deploy --prod
```

### Post-deployment checklist

1. Set all environment variables in Vercel's dashboard
2. Create the `knowledge-base` storage bucket in Supabase
3. Apply `prisma/rls-policies.sql` in the Supabase SQL editor
4. Run `npm run kb:build` locally and commit `data/kb-index.json` (or run it as a build step)
5. Run `npm run db:migrate` against your production Supabase database
6. Verify TTS API keys are working (Uplift AI + ElevenLabs)
7. Test the voice assistant in Chrome/Edge (Web Speech API required)

---

## Acknowledgements

- **Al Khidmat Foundation** — For providing the welfare service data and domain knowledge
- **Uplift AI** — Native Urdu TTS with accurate pronunciation
- **ElevenLabs** — High-quality English TTS (Flash v2.5, low latency)
- **Qwen (DashScope)** — LLM brain for grounded Q&A
- **Hugging Face** — Multilingual embedding model (`paraphrase-multilingual-MiniLM-L12-v2`)

---

*Built for Al Khidmat Foundation — making welfare services accessible through voice.*
