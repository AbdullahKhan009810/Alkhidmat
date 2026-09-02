# Muawin — AI Architecture

**Project:** Muawin · Al Khidmat Foundation Voice Welfare Assistant
**Scope:** RAG-only voice agent (English + Urdu)
**Reference:** Agent flow inspired by UBL Awaz — but with a completely different model stack and no banking action engine.

---

## 1. Design Principles (carried over from UBL Awaz)

1. **Voice-first, call-style interaction** — user starts a "call", speaks naturally, sees a live transcript, and hears spoken answers.
2. **The realtime model handles language only** — speech understanding, language detection (en/ur), conversation, and intent. No business logic inside the model.
3. **RAG is the only AI capability** — the assistant answers strictly from Al Khidmat's knowledge base (3 use cases: facility-finder, eligibility-check, transport-guidance). Out-of-scope questions fail politely to a human-support message.
4. **Deterministic layers around the AI** — retrieval, scoring, logging, and session handling are plain code; the LLM never executes actions.
5. **Everything is logged** — transcripts are saved per session for the admin dashboard.

### Explicitly NOT in scope (unlike UBL Awaz)
| UBL Awaz feature | Muawin |
|---|---|
| Secure identity verification (CNIC/OTP) | ❌ Not needed — welfare info is public |
| Deterministic policy engine (card freeze, fraud case) | ❌ No actions — Q&A only |
| Mock banking APIs | ❌ None |
| Fail-closed human handoff for uncertain *actions* | ✅ Simplified: polite "call our helpline" fallback |

---

## 2. Chosen Stack

| Component | Choice | Role |
|---|---|---|
| **STT + Brain** | **Qwen 3 Omni Flash Realtime** (`qwen3-omni-flash-realtime`) | Realtime speech-to-text, language detection, conversation brain (LLM reasoning) |
| **TTS** | **Gemini 3.1 Flash TTS Preview** via **OpenRouter** (OpenAI-compatible endpoints) | Converts assistant text replies into natural English/Urdu speech |
| **RAG Data** | **Local JSON files** on the local system | Knowledge base source of truth (all 3 use cases, en + ur) |
| **Embeddings** | **`paraphrase-multilingual-MiniLM-L12-v2`** (384 dims) | Multilingual embeddings — handles English ↔ Urdu cross-lingual matching |
| **Backup Vector Store** | **Upstash Vector** | Cloud mirror of the local index; used if local JSON is unavailable or for deployment |
| **App** | Next.js 14 (existing) | UI, API routes, session logging |

> Note: Qwen3-Omni can natively output audio, but per project decision **TTS is delegated to Gemini 3.1 Flash TTS Preview through OpenRouter** for voice quality and Urdu support. Qwen is used for listening + thinking only.

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER (Next.js UI)                        │
│                                                                      │
│  ┌────────────┐   ┌───────────────┐   ┌─────────────────────────┐  │
│  │ Call Panel │   │ Mic Capture   │   │ Live Transcript Panel   │  │
│  │ (orb/mute) │   │ 16kHz PCM/WS  │   │ (en/ur, RTL-aware)      │  │
│  └─────┬──────┘   └──────┬────────┘   └────────────▲────────────┘  │
│        │                 │ audio chunks             │ text deltas   │
└────────┼─────────────────┼─────────────────────────┼───────────────┘
         │                 │                         │
         │            WebSocket                      │
         ▼                 ▼                         │
┌────────────────────────────────────────────────────┼───────────────┐
│              NEXT.JS SERVER (API layer)            │               │
│                                                    │               │
│  ┌──────────────────────────────────────────────┐  │               │
│  │  Realtime Relay Route (/api/realtime)        │  │               │
│  │  • bridges browser ↔ Qwen realtime session   │──┘               │
│  │  • injects RAG context via session/system    │                  │
│  │    instructions                              │                  │
│  └───────┬──────────────────────┬───────────────┘                  │
│          │ audio+text           │ assistant text                   │
│          ▼                      ▼                                  │
│  ┌──────────────────┐   ┌──────────────────────┐                   │
│  │ QWEN 3 OMNI      │   │  RAG RETRIEVER       │                   │
│  │ FLASH REALTIME   │◄──┤  (deterministic)     │                   │
│  │ • STT            │   │                      │                   │
│  │ • Language detect│   │ 1. Embed query       │                   │
│  │ • Brain/LLM      │   │    paraphrase-multi- │                   │
│  │ • Turn-taking    │   │    lingual-MiniLM    │                   │
│  └──────────────────┘   │    -L12-v2 (384d)    │                   │
│                         │                      │                   │
│                         │ 2. Search LOCAL JSON │                   │
│                         │    vector index ─────┼──► data/kb/*.json │
│                         │    (cosine, top-k)   │                   │
│                         │                      │                   │
│                         │ 3. FALLBACK ─────────┼──► Upstash Vector │
│                         └──────────────────────┘    (backup index) │
│                                                                      │
│  ┌──────────────────────────────────────────────┐                    │
│  │  TTS Route (/api/tts)                        │                    │
│  │  • OpenRouter, OpenAI-compatible endpoint    │                    │
│  │  • model: google/gemini-3.1-flash-tts-preview│                    │
│  │  • returns audio (en/ur voice)               │────► browser plays│
│  └──────────────────────────────────────────────┘                    │
│                                                                      │
│  ┌──────────────────────────────────────────────┐                    │
│  │  Conversation Logger (/api/conversations)    │  (existing)       │
│  └──────────────────────────────────────────────┘                    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Voice Pipeline (turn lifecycle)

1. **Call start** — browser opens a mic stream (MediaRecorder/AudioWorklet → 16 kHz mono PCM) and connects to `/api/realtime` over WebSocket.
2. **Session bootstrap** — server opens a Qwen 3 Omni Flash Realtime session, sets:
   - system instructions: Muawin persona + RAG-only policy + answer-language rule (reply in the user's language)
   - retrieved knowledge context for the greeting/initial scope (optional pre-warm)
3. **User speaks** — audio chunks stream to Qwen → it performs **STT + language detection** (en/ur) and emits transcript deltas → relayed to the transcript panel.
4. **Retrieval trigger** — once the user utterance is final, the server:
   - embeds the query text with `paraphrase-multilingual-MiniLM-L12-v2`
   - searches the **local JSON vector index** (cosine similarity, top-k = 4, min score threshold)
   - if local index missing/error → queries **Upstash Vector** (same embeddings, mirrored namespace)
   - injects top chunks into the Qwen session as context (`session.update` / conversation item)
5. **Brain answers** — Qwen generates the reply strictly grounded in the injected chunks. If similarity scores are below threshold or the topic is out of scope → scripted fallback: *"Please call the Al Khidmat helpline…"* (no guessing).
6. **TTS** — the assistant text is sent to `/api/tts` → **OpenRouter OpenAI-compatible endpoint** with model `google/gemini-3.1-flash-tts-preview` → audio returned and played. Language/voice parameter follows the detected language (en / ur).
7. **Logging** — every finalized user/bot message is appended to the in-memory session; on call end it is persisted via `POST /api/conversations` (existing flow) for the admin dashboard.

### Barge-in / interruption
- While TTS is playing, mic stays open; if Qwen detects new speech, playback is cancelled (same behavior UBL Awaz simulates with mute/active states).

---

## 5. RAG Layer Details

### 5.1 Knowledge data — local JSON
Source of truth lives on the local system, organized by use case:

```
data/
└── kb/
    ├── facility-finder.json
    ├── eligibility-check.json
    └── transport-guidance.json
```

Entry shape (bilingual, matches the existing Prisma `KnowledgeBaseEntry` fields so admin uploads can be exported to JSON):

```json
{
  "id": "ff-001",
  "title": "Al Khidmat Hospital Karachi",
  "titleUr": "الخدمت ہسپتال کراچی",
  "category": "facility-finder",
  "language": "both",
  "contentEn": "...",
  "contentUr": "...",
  "lastUpdated": "2026-08-29T00:00:00Z"
}
```

### 5.2 Embedding pipeline (offline, at build/seed time)
- Script (`scripts/embed-kb.ts`) reads the JSON files, chunks long content (~400 chars, sentence-aware).
- Each chunk embedded with **`paraphrase-multilingual-MiniLM-L12-v2`** via `@huggingface/transformers` (ONNX, runs locally, no external API) → 384-dim vectors.
- Output: `data/kb-index.json` — `{ id, text, metadata, vector[] }` records.
- Same script mirrors vectors into **Upstash Vector** (upsert with chunk IDs) to keep the backup in sync.

### 5.3 Query-time retrieval
- Embed the user query with the **same model** (server-side singleton).
- Cosine similarity against the in-memory local index (fast for thousands of chunks).
- **Failover:** any error reading/embedding locally → query Upstash Vector instead. This is the only role of Upstash — a backup store, not the primary.
- Return top-4 chunks above the score threshold with metadata (use case, language).

### 5.4 Grounding policy (enforced in system prompt)
- Answer ONLY from provided context; cite the facility/service name.
- Reply in the same language as the user (English ↔ Urdu).
- Never invent eligibility criteria, addresses, or phone numbers.
- Out-of-scope → helpline fallback message.

---

## 6. API Surface (new routes)

| Route | Purpose |
|---|---|
| `GET/WS /api/realtime` | WebSocket relay between browser mic and Qwen 3 Omni Flash Realtime session |
| `POST /api/rag/query` | Standalone retrieval endpoint (embed query → local JSON → Upstash fallback) — also usable for a future text-chat mode |
| `POST /api/tts` | Text → speech via OpenRouter (OpenAI-compatible `/audio/speech` style) with Gemini 3.1 Flash TTS Preview |
| `POST /api/conversations` | (existing) persist transcripts on call end |

---

## 7. Environment Variables

```env
# STT + Brain — Qwen 3 Omni Flash Realtime (DashScope realtime)
QWEN_REALTIME_API_KEY=
QWEN_REALTIME_MODEL=qwen3-omni-flash-realtime

# TTS — OpenRouter (OpenAI-compatible endpoints)
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TTS_MODEL=google/gemini-3.1-flash-tts-preview

# RAG — local JSON (paths)
KB_DATA_DIR=./data/kb
KB_INDEX_FILE=./data/kb-index.json
EMBEDDING_MODEL=paraphrase-multilingual-MiniLM-L12-v2

# Backup vector store — Upstash
UPSTASH_VECTOR_URL=
UPSTASH_VECTOR_TOKEN=
```

---

## 8. Failure Modes & Fallbacks

| Failure | Behavior |
|---|---|
| Qwen realtime connection drops | Show "reconnecting" state; replay last transcript; auto-reopen session |
| Local JSON index missing/corrupt | Retrieve from Upstash Vector automatically |
| Upstash also down | Assistant answers with scripted generic guidance + helpline number (no retrieval) |
| Retrieval scores below threshold | Scripted "please call our helpline" response — never guess |
| TTS fails | Show the text answer in transcript and toast "audio unavailable" |
| Mixed/unknown language | Default to Urdu (primary audience), keep language toggle manual override |

---

## 9. What We Borrowed From UBL Awaz vs. What Changed

| Aspect | UBL Awaz | Muawin (this project) |
|---|---|---|
| Realtime speech model | Gemini Live / benchmarked speech service | **Qwen 3 Omni Flash Realtime** |
| Model responsibilities | Language detection, STT, intent, speech out | STT + language detection + **brain** (audio out delegated to TTS) |
| TTS | Same speech service | **Gemini 3.1 Flash TTS Preview via OpenRouter** (OpenAI endpoints) |
| Knowledge retrieval | Redis cache + local embeddings over Postgres chunks | **Local JSON index + MiniLM multilingual embeddings**, Upstash backup |
| Actions | Deterministic policy engine + mock banking APIs | ❌ None — **RAG Q&A only** |
| Verification | Simulated OTP / identity steps outside LLM | ❌ None — public welfare information |
| Logging | Redacted audit events | Full transcripts saved (existing Conversation/Message models) |
| Call UX | Orb + live transcript + mute + call end | ✅ Same pattern (already built in Muawin UI) |

---

*This architecture keeps the proven UBL Awaz agent flow (voice-first, deterministic around AI, fail-safe) while using the Muawin stack: Qwen 3 Omni Flash Realtime for listening and thinking, Gemini 3.1 Flash TTS Preview via OpenRouter for speech output, and a local-JSON + Upstash RAG pipeline grounded in Al Khidmat's knowledge base.*
