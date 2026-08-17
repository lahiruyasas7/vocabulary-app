import { describe, expect, it } from "vitest";
import { PartOfSpeech } from "@/app/generated/prisma/enums";
import { exampleSentenceSchema, wordSchema } from "./words";

describe("exampleSentenceSchema", () => {
  it("accepts a valid example sentence", () => {
    const result = exampleSentenceSchema.safeParse("I read a book every day.");

    expect(result.success).toBe(true);
  });

  it("rejects an empty sentence", () => {
    const result = exampleSentenceSchema.safeParse("");

    expect(result.success).toBe(false);
  });

  it("accepts a sentence with exactly 500 characters", () => {
    const sentence = "a".repeat(500);

    const result = exampleSentenceSchema.safeParse(sentence);

    expect(result.success).toBe(true);
  });

  it("rejects a sentence longer than 500 characters", () => {
    const sentence = "a".repeat(501);

    const result = exampleSentenceSchema.safeParse(sentence);

    expect(result.success).toBe(false);
  });
});

describe("wordSchema", () => {
  const validWord = {
    text: "Run",
    meaning: "To move quickly on foot",
    partOfSpeech: PartOfSpeech.VERB,
  };

  it("accepts valid word data", () => {
    const result = wordSchema.safeParse(validWord);

    expect(result.success).toBe(true);
  });

  describe("text", () => {
    it("rejects an empty text", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        text: "",
      });

      expect(result.success).toBe(false);
    });

    it("rejects whitespace-only text", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        text: "   ",
      });

      expect(result.success).toBe(false);
    });

    it("accepts text with exactly 100 characters", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        text: "a".repeat(100),
      });

      expect(result.success).toBe(true);
    });

    it("rejects text longer than 100 characters", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        text: "a".repeat(101),
      });

      expect(result.success).toBe(false);
    });

    it("trims surrounding whitespace", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        text: "  run  ",
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.text).toBe("run");
      }
    });
  });

  describe("meaning", () => {
    it("rejects an empty meaning", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        meaning: "",
      });

      expect(result.success).toBe(false);
    });

    it("rejects whitespace-only meaning", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        meaning: "   ",
      });

      expect(result.success).toBe(false);
    });

    it("accepts meaning with exactly 1000 characters", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        meaning: "a".repeat(1000),
      });

      expect(result.success).toBe(true);
    });

    it("rejects meaning longer than 1000 characters", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        meaning: "a".repeat(1001),
      });

      expect(result.success).toBe(false);
    });

    it("trims surrounding whitespace", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        meaning: "  to move quickly  ",
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.meaning).toBe("to move quickly");
      }
    });
  });

  describe("sinhalaWord", () => {
    it("allows sinhalaWord to be omitted", () => {
      const result = wordSchema.safeParse(validWord);

      expect(result.success).toBe(true);
    });

    it("accepts a valid sinhalaWord", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        sinhalaWord: "දුවනවා",
      });

      expect(result.success).toBe(true);
    });

    it("accepts sinhalaWord with exactly 500 characters", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        sinhalaWord: "a".repeat(500),
      });

      expect(result.success).toBe(true);
    });

    it("rejects sinhalaWord longer than 500 characters", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        sinhalaWord: "a".repeat(501),
      });

      expect(result.success).toBe(false);
    });

    it("trims surrounding whitespace", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        sinhalaWord: "  දුවනවා  ",
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.sinhalaWord).toBe("දුවනවා");
      }
    });
  });

  describe("partOfSpeech", () => {
    it.each(Object.values(PartOfSpeech))(
      "accepts %s",
      (partOfSpeech) => {
        const result = wordSchema.safeParse({
          ...validWord,
          partOfSpeech,
        });

        expect(result.success).toBe(true);
      },
    );

    it("rejects an invalid part of speech", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        partOfSpeech: "INVALID",
      });

      expect(result.success).toBe(false);
    });

    it("rejects a missing part of speech", () => {
      const { partOfSpeech: _, ...wordWithoutPartOfSpeech } = validWord;

      const result = wordSchema.safeParse(wordWithoutPartOfSpeech);

      expect(result.success).toBe(false);
    });
  });

  describe("notes", () => {
    it("allows notes to be omitted", () => {
      const result = wordSchema.safeParse(validWord);

      expect(result.success).toBe(true);
    });

    it("accepts valid notes", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        notes: "Commonly used in everyday English.",
      });

      expect(result.success).toBe(true);
    });

    it("accepts notes with exactly 500 characters", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        notes: "a".repeat(500),
      });

      expect(result.success).toBe(true);
    });

    it("rejects notes longer than 500 characters", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        notes: "a".repeat(501),
      });

      expect(result.success).toBe(false);
    });

    it("trims surrounding whitespace", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        notes: "  Some notes  ",
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.notes).toBe("Some notes");
      }
    });
  });

  describe("exampleSentences", () => {
    it("allows exampleSentences to be omitted", () => {
      const result = wordSchema.safeParse(validWord);

      expect(result.success).toBe(true);
    });

    it("accepts an empty array", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        exampleSentences: [],
      });

      expect(result.success).toBe(true);
    });

    it("accepts valid example sentences", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        exampleSentences: [
          "I run every morning.",
          "She runs five kilometers every day.",
        ],
      });

      expect(result.success).toBe(true);
    });

    it("accepts exactly 10 example sentences", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        exampleSentences: Array.from(
          { length: 10 },
          (_, index) => `Example sentence ${index + 1}`,
        ),
      });

      expect(result.success).toBe(true);
    });

    it("rejects more than 10 example sentences", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        exampleSentences: Array.from(
          { length: 11 },
          (_, index) => `Example sentence ${index + 1}`,
        ),
      });

      expect(result.success).toBe(false);
    });

    it("rejects an empty example sentence", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        exampleSentences: [""],
      });

      expect(result.success).toBe(false);
    });

    it("rejects an example sentence longer than 500 characters", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        exampleSentences: ["a".repeat(501)],
      });

      expect(result.success).toBe(false);
    });
  });

  describe("categoryIds", () => {
    it("allows categoryIds to be omitted", () => {
      const result = wordSchema.safeParse(validWord);

      expect(result.success).toBe(true);
    });

    it("accepts an empty categoryIds array", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        categoryIds: [],
      });

      expect(result.success).toBe(true);
    });

    it("accepts multiple category IDs", () => {
      const result = wordSchema.safeParse({
        ...validWord,
        categoryIds: ["category-1", "category-2"],
      });

      expect(result.success).toBe(true);
    });
  });
});