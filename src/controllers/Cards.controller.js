import JLPTLevel from "../models/Card.js"; 
import Users from "../models/Users.js";

// Shuffle helper
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Helper to find cards by category
const getCardsByCategory = async (category) => {
  const levels = await JLPTLevel.find({ "decks.type": category }).lean();

  const cards = [];

  levels.forEach((level) => {
    const deck = level.decks.find((d) => d.type === category);
    if (!deck) return;

    deck.lessons.forEach((lesson) => {
      if (category === "Kanji") {
        cards.push(
          ...lesson.kanjiCards.map((c) => ({ ...c, level: level.level }))
        );
      } else {
        lesson.modules.forEach((module) => {
          cards.push(
            ...module.cards.map((c) => ({ ...c, level: level.level }))
          );
        });
      }
    });
  });

  return cards;
};

// Fetch all Kanji cards
export const kanji = async (req, res) => {
  const { shuffled = "false", starred = null } = req.query;
  let cards = await getCardsByCategory("Kanji");

  if (starred === "true") {
    cards = cards.filter((card) => card.isStarred);
  }

  return res.json(shuffled === "true" ? shuffle(cards) : cards);
};

// Fetch all Vocabulary cards
export const vocabulary = async (req, res) => {
  const { shuffled = "false", starred = null } = req.query;
  let cards = await getCardsByCategory("Vocabulary");

  if (starred === "true") {
    cards = cards.filter((card) => card.isStarred);
  }

  return res.json(shuffled === "true" ? shuffle(cards) : cards);
};

// Star a card
export const starCard = async (req, res) => {
  try {
    const { level, deckType, lessonNumber, moduleNumber, cardNumber } = req.body;
    if (!level || !deckType || !lessonNumber || !cardNumber) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const jlptLevel = await JLPTLevel.findOne({ level });
    if (!jlptLevel) return res.status(404).json({ error: "Level not found" });

    const deck = jlptLevel.decks.find((d) => d.type === deckType);
    if (!deck) return res.status(404).json({ error: "Deck not found" });

    const lesson = deck.lessons.find((l) => l.lessonNumber === lessonNumber);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    let card;
    if (deckType === "Kanji") {
      card = lesson.kanjiCards.find((c) => c.cardNumber === cardNumber);
    } else {
      if (!moduleNumber) return res.status(400).json({ error: "moduleNumber required for Vocabulary" });
      const module = lesson.modules.find((m) => m.moduleNumber === moduleNumber);
      if (!module) return res.status(404).json({ error: "Module not found" });
      card = module.cards.find((c) => c.cardNumber === cardNumber);
    }

    if (!card) return res.status(404).json({ error: "Card not found" });

    card.isStarred = true;
    await jlptLevel.save();

    return res.status(200).json({ message: "Card starred successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to star card", details: error.message });
  }
};

// Unstar a card
export const unstarCard = async (req, res) => {
  try {
    const { level, deckType, lessonNumber, moduleNumber, cardNumber } = req.body;
    if (!level || !deckType || !lessonNumber || !cardNumber) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const jlptLevel = await JLPTLevel.findOne({ level });
    if (!jlptLevel) return res.status(404).json({ error: "Level not found" });

    const deck = jlptLevel.decks.find((d) => d.type === deckType);
    if (!deck) return res.status(404).json({ error: "Deck not found" });

    const lesson = deck.lessons.find((l) => l.lessonNumber === lessonNumber);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    let card;
    if (deckType === "Kanji") {
      card = lesson.kanjiCards.find((c) => c.cardNumber === cardNumber);
    } else {
      if (!moduleNumber) return res.status(400).json({ error: "moduleNumber required for Vocabulary" });
      const module = lesson.modules.find((m) => m.moduleNumber === moduleNumber);
      if (!module) return res.status(404).json({ error: "Module not found" });
      card = module.cards.find((c) => c.cardNumber === cardNumber);
    }

    if (!card) return res.status(404).json({ error: "Card not found" });

    card.isStarred = false;
    await jlptLevel.save();

    return res.status(200).json({ message: "Card unstarred successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to unstar card", details: error.message });
  }
};
