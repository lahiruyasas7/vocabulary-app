-- Step 1: Create the new ExampleSentence table
CREATE TABLE "ExampleSentence" (
    "id"        TEXT NOT NULL,
    "text"      TEXT NOT NULL,
    "order"     INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wordId"    TEXT NOT NULL,

    CONSTRAINT "ExampleSentence_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create indexes
CREATE INDEX "ExampleSentence_wordId_idx" ON "ExampleSentence"("wordId");
CREATE INDEX "ExampleSentence_wordId_order_idx" ON "ExampleSentence"("wordId", "order");

-- Step 3: Add foreign key constraint
ALTER TABLE "ExampleSentence"
    ADD CONSTRAINT "ExampleSentence_wordId_fkey"
    FOREIGN KEY ("wordId")
    REFERENCES "Word"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Step 4: Migrate existing exampleSentence data into the new table
-- Only migrate rows where exampleSentence is not null and not empty
INSERT INTO "ExampleSentence" ("id", "text", "order", "wordId")
SELECT
    -- Generate a cuid-like unique id using gen_random_uuid()
    REPLACE(gen_random_uuid()::text, '-', ''),
    "exampleSentence",
    0,
    "id"
FROM "Word"
WHERE "exampleSentence" IS NOT NULL
  AND TRIM("exampleSentence") <> '';

-- Step 5: Verify migration before dropping (optional safety check)
-- This will raise an error and abort if counts don't match,
-- protecting your data
DO $$
DECLARE
    word_count INT;
    sentence_count INT;
BEGIN
    SELECT COUNT(*) INTO word_count
    FROM "Word"
    WHERE "exampleSentence" IS NOT NULL
      AND TRIM("exampleSentence") <> '';

    SELECT COUNT(*) INTO sentence_count
    FROM "ExampleSentence";

    IF word_count <> sentence_count THEN
        RAISE EXCEPTION
            'Migration mismatch: % words had sentences but only % were migrated',
            word_count, sentence_count;
    END IF;

    RAISE NOTICE 'Migration verified: % sentences migrated successfully', sentence_count;
END $$;

-- Step 6: Only now drop the old column
ALTER TABLE "Word" DROP COLUMN "exampleSentence";