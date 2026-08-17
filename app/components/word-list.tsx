"use client";

import { useState, useCallback } from "react";
import { WordCard } from "./word-card";
import { WordDetailModal } from "./word-detail-modal";

type WordWithRelations = {
  id: string;
  text: string;
  meaning: string;
  sinhalaWord: string | null;
  partOfSpeech: string;
  exampleSentences: { id: string; text: string; order: number }[];
  notes: string | null;
  createdAt: Date;
  categories: { id: string; name: string }[];
};

interface WordListProps {
  words: WordWithRelations[];
}

export function WordList({ words }: WordListProps) {
  const [selectedWord, setSelectedWord] = useState<WordWithRelations | null>(
    null,
  );

  const handleClose = useCallback(() => setSelectedWord(null), []);

  return (
    <>
      <div className="space-y-2">
        {words.map((word) => (
          <WordCard
            key={word.id}
            word={word}
            onClick={() => setSelectedWord(word)}
          />
        ))}
      </div>

      <WordDetailModal word={selectedWord} onClose={handleClose} />
    </>
  );
}
