# Muawin — Use Cases Offered in RAG

**Project:** Muawin · Al Khidmat Foundation Voice-Powered Welfare Assistant  
**Scope:** Retrieval-Augmented Generation (RAG) Use-Case Documentation  

---

## Table of Contents

1. [Overview](#1-overview)
2. [RAG Architecture at a Glance](#2-rag-architecture-at-a-glance)
3. [Use Case 1 — Facility & Medical Camp Finder](#3-use-case-1--facility--medical-camp-finder)
4. [Use Case 2 — Free-Service Eligibility Check](#4-use-case-2--free-service-eligibility-check)
5. [Use Case 3 — Transport & Ambulance Guidance](#5-use-case-3--transport--ambulance-guidance)
6. [How RAG Works in Muawin](#6-how-rag-works-in-muawin)
7. [Knowledge Base Structure](#7-knowledge-base-structure)
8. [Grounding Policy & Safety](#8-grounding-policy--safety)
9. [Out-of-Scope Handling](#9-out-of-scope-handling)
10. [Failure Modes & Fallbacks](#10-failure-modes--fallbacks)

---

## 1. Overview

Muawin (Urdu/Arabic for "Helper") is a **voice-powered welfare assistance platform** built for the **Al Khidmat Foundation**, a Pakistani humanitarian organization. It provides a bilingual (**English & Urdu**) voice-assistant interface that helps citizens find and access free welfare services.

The AI backbone of Muawin is a **Retrieval-Augmented Generation (RAG)** pipeline. Every answer the assistant gives is **grounded in a curated knowledge base** — the LLM never invents facts, never executes actions, and never guesses. This ensures that citizens always receive **accurate, verified information** about Al Khidmat's services.

### Three Core Use Cases

All three use cases are served through the same RAG pipeline. The assistant identifies the relevant category from the user's natural-language query and retrieves the most relevant knowledge chunks.

| # | Use Case | Category Key | Description |
|---|---|---|---|
| 1 | Facility & Medical Camp Finder | `facility-finder` | Locate nearby Al Khidmat hospitals, clinics, and medical camps |
| 2 | Free-Service Eligibility Check | `eligibility-check` | Understand eligibility and application process for free services |
| 3 | Transport & Ambulance Guidance | `transport-guidance` | Request ambulance services and patient transport |

---

## 2. RAG Architecture at a Glance

```
User speaks (English or Urdu)
        │
        ▼
┌─────────────────────┐
│  Speech Recognition  │  Qwen 3 Omni Flash Realtime (STT)
│  + Language Detect   │
└─────────┬───────────┘
          │ user utterance (text)
          ▼
┌─────────────────────┐
│   RAG RETRIEVER     │
│                     │
│  1. Embed query     │  paraphrase-multilingual-MiniLM-L12-v2 (384-dim)
│  2. Search index    │  Local JSON vector index (cosine similarity, top-4)
│  3. Fallback        │  Upstash Vector (if local index unavailable)
└─────────┬───────────┘
          │ relevant knowledge chunks
          ▼
┌─────────────────────┐
│   LLM (Qwen Plus)   │  Grounded system prompt + retrieved context
│   Answer Generation  │  Strict rules: answer only from sources
└─────────┬───────────┘
          │ text answer
          ▼
┌─────────────────────┐
│   Text-to-Speech     │  Uplift AI (Urdu) / ElevenLabs (English)
└─────────────────────┘
```

---

## 3. Use Case 1 — Facility & Medical Camp Finder

**Category:** `facility-finder`  
**Knowledge Source:** `data/kb/facility-finder.json`

### What It Does

Helps users locate nearby Al Khidmat hospitals, clinics, and medical camps based on their area and needs. The assistant provides details about:

- **Hospital locations and addresses** across Rawalpindi and Islamabad
- **Available departments** (Cardiology, Pediatrics, Surgery, Gynecology, Orthopedics, Dermatology, ENT, Dental, etc.)
- **Free services** offered at each facility (OPD, medicines, diagnostic tests, surgeries)
- **Timings and contact numbers** for each facility
- **Weekly medical camp schedules** at various community locations

### Example Queries

| Language | Example Query |
|---|---|
| English | "Where is the nearest Al Khidmat hospital?" |
| English | "What departments are available at Shifa Hospital?" |
| English | "Are there any free medical camps this week?" |
| Urdu | "الخدمت ہسپتال کہاں ہے؟" |
| Urdu | "مفت میڈیکل کیمپ کب لگتا ہے؟" |
| Urdu | "سیٹلائٹ ٹاؤن میں کون سا ہسپتال ہے؟" |

### Knowledge Entries

| ID | Title | Language |
|---|---|---|
| `ff-01` | Al Khidmat Shifa Hospital — Satellite Town | Both (en/ur) |
| `ff-02` | Al Khidmat Hospital — Murree Road | Both (en/ur) |
| `ff-03` | Al Khidmat Medical Center — GT Road | Urdu |
| `ff-04` | Weekly Free Medical Camps Schedule | Urdu |

### Key Data Points Covered

- **Addresses** — Exact street addresses and landmarks for every facility
- **Phone numbers** — Direct helpline and extension numbers
- **Timings** — OPD hours, emergency availability (24/7), and camp schedules
- **Departments** — Full list of medical departments at each hospital
- **Free services** — Emergency care, OPD, medicines, lab tests, surgeries for eligible patients
- **Facilities** — Ambulance availability, parking, wheelchair access
- **Medical camp schedule** — Day-wise camp locations across Rawalpindi (Saturday through Friday)

---

## 4. Use Case 2 — Free-Service Eligibility Check

**Category:** `eligibility-check`  
**Knowledge Source:** `data/kb/eligibility-check.json`

### What It Does

Guides users through the eligibility criteria for Al Khidmat's free services. Covers the complete journey from understanding requirements to receiving treatment, including:

- **Income requirements** and priority categories
- **Required documents** for registration
- **Step-by-step application process**
- **Free surgery program** details
- **Free dialysis program** details

### Example Queries

| Language | Example Query |
|---|---|
| English | "How can I get free treatment at Al Khidmat?" |
| English | "What documents do I need for free surgery?" |
| English | "Am I eligible for free dialysis?" |
| Urdu | "مفت علاج کے لیے کیا ضروری ہے؟" |
| Urdu | "مفت سرجری کیسے ہو سکتی ہے؟" |
| Urdu | "ڈائیلاسس کے لیے رجسٹریشن کیسے ہوگی؟" |

### Knowledge Entries

| ID | Title | Language |
|---|---|---|
| `ec-01` | Eligibility Criteria for Free Medical Services | English |
| `ec-02` | How to Apply for Free Treatment — Step by Step Guide | English |
| `ec-03` | Free Surgery Program — Eligibility and Process (مفت سرجری پروگرام) | Urdu |
| `ec-04` | Free Dialysis Program — Details and Registration (مفت ڈائیلاسس پروگرام) | Urdu |

### Key Data Points Covered

- **Income threshold** — Monthly household income below PKR 30,000
- **Auto-eligible groups** — BISP/Benazir Income Support beneficiaries
- **Priority categories** — Widows, orphans, persons with disabilities, senior citizens (60+), chronic disease patients, daily wage workers, unemployed persons
- **Required documents** — CNIC, B-Form, income certificate, utility bills, residence proof, medical reports
- **Application process** — 6-step process from visiting a center to receiving the free treatment card
- **Card validity** — 1 year, renewable
- **Free surgery types** — Cardiac, kidney transplant, liver transplant, cancer, eye, orthopedic, general, neuro, plastic, urology
- **Dialysis program** — 20-machine center, 3 shifts/day, 7 days/week, free medicines and transport support
- **Wait times** — Emergency (immediate), critical (1–2 weeks), non-critical (1–3 months)

---

## 5. Use Case 3 — Transport & Ambulance Guidance

**Category:** `transport-guidance`  
**Knowledge Source:** `data/kb/transport-guidance.json`

### What It Does

Provides information on how to request ambulance services, patient transport, and related logistics support. Covers:

- **Emergency ambulance service** (dial 1122)
- **Non-emergency patient transport** booking
- **Service area coverage** map across Rawalpindi and Islamabad
- **Specialized transport** — ICU, neonatal, and wheelchair-accessible ambulances

### Example Queries

| Language | Example Query |
|---|---|
| English | "How do I call an ambulance?" |
| English | "What areas does Al Khidmat ambulance cover?" |
| English | "Can I book transport for a dialysis patient?" |
| Urdu | "ایمبولینس کیسے بلاؤں؟" |
| Urdu | "ایمبولینس کس علاقے میں آتی ہے؟" |
| Urdu | "ICU ایمبولینس کیسے بک ہوگی؟" |

### Knowledge Entries

| ID | Title | Language |
|---|---|---|
| `tg-01` | Emergency Ambulance Service (1122) | English |
| `tg-02` | Non-Emergency Patient Transport Service | English |
| `tg-03` | Ambulance Service Areas and Coverage Map (ایمبولینس سروس علاقے) | Urdu |
| `tg-04` | Specialized Transport — ICU, Neonatal, and Wheelchair (خصوصی ٹرانسپورٹ) | Urdu |

### Key Data Points Covered

- **Emergency number** — 1122 (free for all emergency cases)
- **Alternative number** — 051-4853951
- **Ambulance features** — ALS-equipped, cardiac monitor, defibrillator, oxygen, GPS tracking, wheelchair accessible
- **Response times** — City areas: 10–15 min, suburban: 15–25 min, highway/remote: 25–40 min
- **Full coverage areas** — Satellite Town, Murree Road, GT Road, Saddar, DHA, Bahria Town (Phases 1–8), all major Islamabad sectors
- **Limited coverage areas** — Bahria Town Phase 9, DHA Phase 3–5, certain Islamabad sectors
- **No coverage areas** — Murree (except main road), Taxila, Wah Cantt, Kahuta
- **Vehicle types** — Basic Ambulance, ICU Ambulance, Neonatal Ambulance, Bariatric Ambulance
- **Non-emergency charges** — PKR 500–1000 within Rawalpindi/Islamabad, PKR 50/km inter-city (free for eligible patients with treatment card)
- **Booking requirements** — 24 hours advance notice for routine transfers, 48 hours for inter-city
- **WhatsApp booking** — 0300-1234567

---

## 6. How RAG Works in Muawin

### 6.1 Knowledge Base Storage

The knowledge base lives as **local JSON files** on the server, organized by use case:

```
data/
└── kb/
    ├── facility-finder.json      # 4 entries (hospitals + medical camps)
    ├── eligibility-check.json    # 4 entries (criteria + programs)
    └── transport-guidance.json   # 4 entries (ambulance + transport)
```

Each entry is **bilingual** — containing both English (`contentEn`) and Urdu (`contentUr`) text, along with metadata like category, language, and status.

### 6.2 Offline Indexing (Build Time)

The embedding pipeline (`scripts/embed-kb.ts`) runs offline to prepare the retrieval index:

1. **Reads** all JSON knowledge base files
2. **Chunks** long content into ~400-character segments (sentence-aware splitting)
3. **Embeds** each chunk using `paraphrase-multilingual-MiniLM-L12-v2` (384-dim vectors, runs locally via ONNX)
4. **Writes** the vector index to `data/kb-index.json`
5. **Syncs** vectors to **Upstash Vector** as a cloud backup

### 6.3 Query-Time Retrieval

When a user asks a question:

1. **Embed** the user's query with the same multilingual model
2. **Search** the local JSON vector index using cosine similarity (top-4 chunks)
3. **Fallback** to Upstash Vector if the local index is unavailable
4. **Return** the most relevant knowledge chunks with metadata

### 6.4 Answer Generation

The retrieved chunks are injected into the **LLM system prompt** as the only allowed knowledge source. The model is instructed to:

- Answer **only** from the provided context
- Reply in the **same language** as the user (English or Urdu)
- **Never invent** addresses, phone numbers, timings, or eligibility rules
- Use a **conversational tone** — warm, concise, like a human phone operator
- Keep answers **under 35 words** unless the user asks for details

### 6.5 Multilingual Support

The embedding model (`paraphrase-multilingual-MiniLM-L12-v2`) is specifically chosen for its **cross-lingual capability** — a user can ask in Urdu and the system retrieves relevant English content (and vice versa). The LLM then generates the response in the user's language.

---

## 7. Knowledge Base Structure

Each knowledge base entry follows this schema:

```json
{
  "id": "ff-01-al-khidmat-shifa-hospita",
  "title": "Al Khidmat Shifa Hospital - Satellite Town",
  "titleUr": "الخدمت شفا ہسپتال - سیٹلائٹ ٹاؤن",
  "category": "facility-finder",
  "language": "both",
  "status": "active",
  "contentEn": "Full English content with addresses, departments, services...",
  "contentUr": "مکمل اردو مواد پتوں، شعبہ جات، سروسز کے ساتھ..."
}
```

### Schema Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier (prefix indicates category: `ff-`, `ec-`, `tg-`) |
| `title` | string | English title of the entry |
| `titleUr` | string | Urdu title of the entry |
| `category` | enum | One of: `facility-finder`, `eligibility-check`, `transport-guidance` |
| `language` | enum | `en`, `ur`, or `both` |
| `status` | enum | `active` or `inactive` |
| `contentEn` | string | Full English content text |
| `contentUr` | string | Full Urdu content text |

---

## 8. Grounding Policy & Safety

Muawin enforces a **strict grounding policy** to ensure the safety and accuracy of all responses:

### Rules Enforced in the System Prompt

1. **Source-only answers** — The LLM can only use information from the retrieved knowledge base chunks. It cannot draw from its general training knowledge.
2. **No hallucination** — The LLM is explicitly instructed to never invent addresses, phone numbers, timings, eligibility rules, or prices.
3. **Language matching** — Responses must be in the same language as the user's message.
4. **Conversational format** — No numbered lists, bullet points, headings, or markdown formatting. Answers are woven into natural spoken sentences.
5. **Brevity** — Voice-friendly answers kept under 35 words unless the user explicitly asks for details.
6. **No Arabic diacritics** — Urdu output avoids vowel marks (zair, zabar, paish) since TTS handles pronunciation automatically.

### Small Talk & Closing Handling

Before reaching the RAG pipeline, the system handles common conversational patterns with **instant fixed responses** (no LLM call needed):

- **Greetings** — "Assalam o Alaikum! I'm speaking from Al Khidmat Foundation..."
- **Identity questions** — "I'm Muawin, speaking from Al Khidmat Foundation..."
- **How are you** — "I'm doing great, thank you! How about you?"
- **Thanks/Goodbye** — Warm closing messages with helpline reminder

These fixed responses also benefit from **TTS audio caching** — repeated phrases play instantly without regenerating audio.

---

## 9. Out-of-Scope Handling

When a user's question falls **outside the three supported use cases**, or when the retrieval returns no relevant chunks, the system responds with a **scripted helpline fallback** instead of guessing:

**English:**
> "I couldn't find that in the Al Khidmat knowledge base. Please call the Al Khidmat helpline at 051-4853951 (or dial 1122 for emergencies) for direct assistance."

**Urdu:**
> "مجھے الخدمت کے ریکارڈ میں یہ معلومات نہیں ملیں۔ براہ کرم براہِ راست مدد کے لیے الخدمت ہیلپ لائن 051-4853951 پر کال کریں (ایمرجنسی کے لیے 1122 ڈائل کریں)۔"

This ensures the user is never left without help — they are always directed to a human who can assist.

---

## 10. Failure Modes & Fallbacks

| Failure Scenario | System Behavior |
|---|---|
| Local JSON index missing or corrupt | Automatically retrieve from **Upstash Vector** (cloud backup) |
| Upstash Vector also unavailable | Respond with the **scripted helpline fallback** message |
| Retrieval scores below threshold | **No guessing** — return the helpline fallback instead |
| TTS audio generation fails | Display the **text answer** in the transcript panel with a toast notification |
| Mixed or unknown language | **Default to Urdu** (primary audience); user can override via language toggle |
| Qwen API connection drops | Show "reconnecting" state and auto-reopen the session |
| Out-of-scope question | Polite helpline redirect — **never guess or make up information** |

---

## Summary

Muawin's RAG pipeline serves exactly **three welfare use cases**, all grounded in a verified knowledge base:

| Use Case | What Users Can Ask About |
|---|---|
| **Facility & Medical Camp Finder** | Hospital locations, departments, free services, medical camp schedules, contact details |
| **Free-Service Eligibility Check** | Income requirements, required documents, application process, free surgery & dialysis programs |
| **Transport & Ambulance Guidance** | Emergency ambulance (1122), non-emergency transport booking, coverage areas, specialized vehicles |

Every answer is **accurate, bilingual, and conversational** — designed to sound like a helpful human phone operator, not a chatbot. When the system doesn't know, it says so and directs the user to the Al Khidmat helpline.

---

*Document generated for the Muawin project — Al Khidmat Foundation's voice-powered welfare assistance platform.*
