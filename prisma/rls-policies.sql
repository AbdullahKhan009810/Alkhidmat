-- Enable Row Level Security on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KnowledgeBaseEntry" ENABLE ROW LEVEL SECURITY;

-- ── User policies ────────────────────────────────────────
-- Only authenticated users can read users
CREATE POLICY "Users can read all users"
  ON "User" FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can insert users
CREATE POLICY "Users can insert users"
  ON "User" FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ── Conversation policies ────────────────────────────────
-- Authenticated users can read all conversations
CREATE POLICY "Users can read all conversations"
  ON "Conversation" FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create conversations
CREATE POLICY "Users can create conversations"
  ON "Conversation" FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update conversations
CREATE POLICY "Users can update conversations"
  ON "Conversation" FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete conversations
CREATE POLICY "Users can delete conversations"
  ON "Conversation" FOR DELETE
  TO authenticated
  USING (true);

-- ── Message policies ─────────────────────────────────────
-- Authenticated users can read all messages
CREATE POLICY "Users can read all messages"
  ON "Message" FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create messages
CREATE POLICY "Users can create messages"
  ON "Message" FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can delete messages
CREATE POLICY "Users can delete messages"
  ON "Message" FOR DELETE
  TO authenticated
  USING (true);

-- ── Knowledge Base policies ──────────────────────────────
-- Authenticated users can read all KB entries
CREATE POLICY "Users can read all KB entries"
  ON "KnowledgeBaseEntry" FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create KB entries
CREATE POLICY "Users can create KB entries"
  ON "KnowledgeBaseEntry" FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update KB entries
CREATE POLICY "Users can update KB entries"
  ON "KnowledgeBaseEntry" FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete KB entries
CREATE POLICY "Users can delete KB entries"
  ON "KnowledgeBaseEntry" FOR DELETE
  TO authenticated
  USING (true);
