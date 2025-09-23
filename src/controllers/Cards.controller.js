import Card from "../models/Card.js";
import Users from "../models/Users.js";

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const cards = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id))
    return res.status(400).json({ message: "Valid Card ID is required" });
  const card = await Card.findOne({ id: parseInt(id) }).lean();
  if (!card)
    return res.status(404).json({ message: `Card with ID ${id} not found` });
  return res.json(card);
};

export const kanji = async (req, res) => {
  const { shuffled = "false", starred = null } = req.query;
  const cards = await Card.find({ category: "Kanji" }).lean();
  if (starred === "true") {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = await Users.findOne({ email: req.user.email }).select(
      "starredCards"
    );
    const starredCards = cards.filter((card) =>
      user.starredCards.includes(card.id)
    );
    return res.json(shuffled === "true" ? shuffle(starredCards) : starredCards);
  }
  return res.json(shuffled === "true" ? shuffle(cards) : cards);
};

export const vocabulary = async (req, res) => {
  const { shuffled = "false", starred = null } = req.query;
  const cards = await Card.find({ category: "Vocabulary" }).lean();
  if (starred === "true") {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = await Users.findOne({ email: req.user.email }).select(
      "starredCards"
    );
    const starredCards = cards.filter((card) =>
      user.starredCards.includes(card.id)
    );
    return res.json(shuffled === "true" ? shuffle(starredCards) : starredCards);
  }
  return res.json(shuffled === "true" ? shuffle(cards) : cards);
};

export const star = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Card ID is required" });
  }
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const user = await Users.findOne({ email: req.user.email });
  const idInt = parseInt(id);
  const card = await Card.findOne({ id: idInt }).lean();
  if (!card)
    return res.status(404).json({ message: `Card with ID ${id} not found` });
  if (req.method === "POST") {
    if (!user.starredCards.includes(idInt)) user.starredCards.push(idInt);
    else
      return res
        .status(400)
        .json({ message: `Card with ID ${id} is already starred` });
    await user.save();
    return res.json({ message: `Card with ID ${id} starred` });
  } else if (req.method === "DELETE") {
    if (user.starredCards.includes(idInt))
      user.starredCards.pop(user.starredCards.indexOf(idInt));
    else
      return res
        .status(400)
        .json({ message: `Card with ID ${id} is not starred` });
    await user.save();
    return res.json({ message: `Card with ID ${id} unstarred` });
  }
};

export const addCard = async (req, res) => {
  try {
    const { id, question, answer, category, level } = req.body;

    if (!id || !question || !answer || !category || !level) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newCard = new Card({ id, question, answer, category, level });
    await newCard.save();

    res
      .status(201)
      .json({ message: "Card created successfully", card: newCard });
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ error: "Failed to create card", details: error.message });
  }
};

export const addBulkCards = async (req, res) => {
  try {
    const cards = req.body;

    if (!Array.isArray(cards) || cards.length === 0) {
      return res
        .status(400)
        .json({ error: "Request body must be an array of cards" });
    }

    const inserted = await Card.insertMany(cards, { ordered: false });

    res
      .status(201)
      .json({ message: "Cards inserted successfully", count: inserted.length });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to insert cards", details: error.message });
  }
};
