"use client";

import { useState, useCallback } from "react";
import { PhraseCard } from "./phrase-card";
import { PhraseDetailModal } from "./phrase-detail-modal";

type PhraseWithRelations = {
  id: string;
  text: string;
  meaning: string;
  sinhalaPhrase: string | null;
  phraseType: string | null;
  register: string | null;
  exampleSentences: { id: string; text: string; order: number }[];
  notes: string | null;
  createdAt: Date;
};

interface PhraseListProps {
  phrases: PhraseWithRelations[];
}

export function PhraseList({ phrases }: PhraseListProps) {
  const [selectedPhrase, setSelectedPhrase] = useState<PhraseWithRelations | null>(
    null,
  );

  const handleClose = useCallback(() => setSelectedPhrase(null), []);

  return (
    <>
      <div className="space-y-2">
        {phrases.map((phrase) => (
          <PhraseCard
            key={phrase.id}
            phrase={phrase}
            onClick={() => setSelectedPhrase(phrase)}
          />
        ))}
      </div>

      <PhraseDetailModal phrase={selectedPhrase} onClose={handleClose} />
    </>
  );
}