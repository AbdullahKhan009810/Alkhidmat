# Muawin — Project Overview & Documentation

**Organization:** Al Khidmat Foundation
**Project Name:** Muawin (Voice-Powered Welfare Assistant)
**Languages:** English & Urdu (اردو)

---

## 1. What Is Muawin?

**Muawin** (Urdu/Arabic for "Helper") is a **voice-powered welfare assistance platform** built for **Al Khidmat Foundation**, a Pakistani humanitarian and social-welfare organization. The application provides a bilingual (English & Urdu) voice-assistant interface that helps citizens find and access Al Khidmat's free welfare services — such as medical camps, financial aid, and ambulance/transport facilities.

At its core, Muawin simulates a phone-call–style interaction where a user "calls" the assistant, speaks in English or Urdu, and receives a live transcript of the conversation. The system is designed to lower the barrier for people who may not be tech-savvy or literate in English, making welfare services accessible through natural voice conversation.

---

## 2. What Will It Be Used For?

Muawin is intended to serve as the **front-door digital assistant** for Al Khidmat Foundation's public-facing welfare programs. Its primary use cases are:

| Use Case | Description |
|---|---|
| **Facility & Medical Camp Finder** | Helps users locate nearby Al Khidmat hospitals, clinics, medical camps, and other welfare facilities based on their area and needs. |
| **Free-Service Eligibility Check** | Guides users through eligibility criteria for Al Khidmat's free services (e.g., free medical treatment, financial assistance, food programs). |
| **Transport & Ambulance Guidance** | Provides information on how to request ambulance services, transport aid, and related logistics support from Al Khidmat. |

### Target Audience
- **Citizens** across Pakistan who need welfare assistance, especially those more comfortable speaking Urdu.
- **Al Khidmat Foundation staff/admins** who manage the knowledge base, monitor conversations, and oversee welfare case data.

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (via Supabase) |
| ORM | Prisma 6 |
| Authentication | Supabase Auth (cookie-based sessions) |
| File Storage | Supabase Storage (PDF documents) |
| Icons | Lucide React |
| Deployment | Vercel (recommended) |

---

## 4. Application Architecture

### 4.1 Public-Facing App (`/`)
The home page presents a clean, card-based UI with two panels side by side:

- **Left — Call Panel**: A simulated voice-call interface with a sound-wave icon, Start/End Call button, Mute/Unmute toggle, and a live status indicator (Ready to Assist / Listening).
- **Right — Transcript Panel**: Displays a real-time chat-style transcript of the conversation between the user and the bot assistant.

A **language toggle** at the top lets users switch between **English** and **Urdu**, which flips the entire UI direction (LTR ↔ RTL) and swaps all text strings.

When the user ends a call, the full conversation is saved to the PostgreSQL database via the `/api/conversations` endpoint.

### 4.2 Admin Panel (`/admin/*`)
A protected, authenticated dashboard for Al Khidmat staff.

**Dashboard (`/admin/dashboard`)**
- **Total Cases Card** — Shows the count of all recorded conversations.
- **Transcripts Card** — Displays a preview of the most recent conversation with user/bot messages in the correct language and direction.
- **Recent Conversations Table** — Full table of all conversations with session ID, transcript preview, language, message count, and a "View" action that opens a detailed transcript modal with chat-bubble formatting.

**Knowledge Base (`/admin/knowledge-base`)**
- **Use Case Cards** — Filterable cards for the 3 supported categories, each showing entry counts.
- **Search** — Full-text search across entry titles (English and Urdu) and IDs.
- **Upload Document** — Modal form to upload PDF documents (max 10MB) to Supabase Storage, associated with a use-case category, title, and optional text content.
- **Entries Table** — Lists all knowledge-base entries with ID, title, use case, file attachment status, active/inactive status, and last-updated date.
- **Entry Detail Modal** — Shows full bilingual content (Urdu in RTL, English in LTR), file download link, and metadata.

### 4.3 Authentication & Middleware
- The `/admin` login page is public; all other `/admin/*` routes are protected by **Next.js middleware** that checks the Supabase Auth session via cookies.
- Unauthenticated users are redirected to the login page.
- API routes for conversations and knowledge base also enforce Supabase Auth on the server side.

---

## 5. Database Schema

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│     User     │       │   Conversation   │       │       Message        │
├──────────────┤       ├──────────────────┤       ├──────────────────────┤
│ id (PK)      │───┐   │ id (PK)          │───┐   │ id (PK)              │
│ email        │   └──<│ userId (FK)      │   └──<│ conversationId (FK)  │
│ name         │       │ sessionId        │       │ role (user/bot)      │
│ role (admin) │       │ language (en/ur) │       │ content              │
│ createdAt    │       │ status           │       │ timestamp            │
│ updatedAt    │       │ createdAt        │       └──────────────────────┘
└──────────────┘       │ updatedAt        │
                       └──────────────────┘

┌────────────────────────────┐
│    KnowledgeBaseEntry      │
├────────────────────────────┤
│ id (PK)                    │
│ title / titleUr            │
│ category (3 use cases)     │
│ language (en/ur/both)      │
│ status (active/inactive)   │
│ contentEn / contentUr      │
│ fileUrl / fileName         │
│ lastUpdated / createdAt    │
│ updatedAt                  │
└────────────────────────────┘
```

---

## 6. API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/conversations | Required | List all conversations with messages (admin) |
| POST | /api/conversations | Public | Save a new conversation from the voice assistant |
| GET | /api/conversations/[id] | Required | Get a single conversation by ID |
| GET | /api/knowledge-base | Required | List/search KB entries, filter by category |
| POST | /api/knowledge-base | Required | Create a new knowledge-base entry |
| GET/DELETE | /api/knowledge-base/[id] | Required | Get or delete a single KB entry |
| POST | /api/upload | Public | Upload a PDF file to Supabase Storage |
| POST | /api/admin/logout | — | Log out the admin user |

---

## 7. Key Features Summary

1. **Bilingual Voice Assistant** — Full English and Urdu support with RTL layout switching.
2. **Call Simulation** — Phone-call–style UX with start/end call, mute, and live status.
3. **Live Transcript** — Real-time chat transcript displayed alongside the call panel.
4. **Conversation Persistence** — All conversations are saved to PostgreSQL with session IDs.
5. **Admin Dashboard** — View cases, browse conversation transcripts, and monitor activity.
6. **Knowledge Base Management** — CRUD for bilingual entries across 3 welfare use cases, with PDF file upload to Supabase Storage.
7. **Protected Admin Area** — Supabase Auth–based route protection via Next.js middleware.
8. **Responsive Design** — Mobile-first layout with collapsible sidebar and adaptive grid.

---

## 8. Current Status & Future Direction

**Current state:** The project is a functional prototype/demo with:
- Working UI for both public and admin sections
- Database models and API routes fully wired
- Seed scripts for populating sample conversations and knowledge-base entries
- File upload working via Supabase Storage

**Planned AI stack (see `AI-Architecture.md` for the full design):**
- **STT + Brain** — Qwen 3 Omni Flash Realtime (speech-to-text, language detection, conversation reasoning)
- **TTS** — Gemini 3.1 Flash TTS Preview via OpenRouter (OpenAI-compatible endpoints)
- **RAG** — Knowledge base stored as local JSON, embedded with `paraphrase-multilingual-MiniLM-L12-v2`, with Upstash Vector as the backup store. RAG Q&A is the only AI capability — no action engine.
- Agent flow pattern adapted from the UBL Awaz voice agent (voice-first call UX, deterministic layers around the AI, fail-safe fallbacks).

**Other next steps:**
- **Real-time Streaming** — WebSocket for live transcript updates during an actual call.
- **User Authentication** — Extending auth to the public side so citizens can access their conversation history.
- **Analytics & Reporting** — Charts and insights on conversation volume, popular queries, and service demand.

---

*Document generated for the Muawin project — Al Khidmat Foundation's voice-powered welfare assistance platform.*
