-- CreateEnum
CREATE TYPE "PhraseType" AS ENUM ('IDIOM', 'PHRASAL_VERB', 'COLLOCATION', 'PROVERB', 'EXPRESSION', 'CLAUSE');

-- CreateEnum
CREATE TYPE "Register" AS ENUM ('FORMAL', 'INFORMAL', 'SLANG', 'NEUTRAL');

-- CreateTable
CREATE TABLE "Phrase" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "sinhalaPhrase" TEXT,
    "phraseType" "PhraseType",
    "register" "Register",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Phrase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhraseExampleSentence" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phraseId" TEXT NOT NULL,

    CONSTRAINT "PhraseExampleSentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PhraseCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PhraseCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Phrase_userId_idx" ON "Phrase"("userId");

-- CreateIndex
CREATE INDEX "Phrase_userId_text_idx" ON "Phrase"("userId", "text");

-- CreateIndex
CREATE INDEX "PhraseExampleSentence_phraseId_idx" ON "PhraseExampleSentence"("phraseId");

-- CreateIndex
CREATE INDEX "PhraseExampleSentence_phraseId_order_idx" ON "PhraseExampleSentence"("phraseId", "order");

-- CreateIndex
CREATE INDEX "_PhraseCategories_B_index" ON "_PhraseCategories"("B");

-- AddForeignKey
ALTER TABLE "Phrase" ADD CONSTRAINT "Phrase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhraseExampleSentence" ADD CONSTRAINT "PhraseExampleSentence_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhraseCategories" ADD CONSTRAINT "_PhraseCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhraseCategories" ADD CONSTRAINT "_PhraseCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Phrase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
