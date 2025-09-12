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
  if (!id || isNaN(id)) return res.status(400).json({ message: "Valid Card ID is required" });
  const card = await Card.findOne({ id: parseInt(id) });
  if (!card) return res.status(404).json({ message: `Card with ID ${id} not found` });
  return res.json(card);
};

export const kanji = async (req, res) => {
  const { shuffled = "false", starred = null } = req.query;
  const cards = await Card.find({ category: "Kanji" });
  if (starred === "true") {
    const starredIDs = await Users.findOne({ email: req.user.email }).select("starredCards").starredCards;
    const starredCards = cards.filter(card => starredIDs.includes(card.id));
    return res.json(shuffled === "true" ? shuffle(starredCards) : starredCards);
  }
  return res.json(shuffled === "true" ? shuffle(cards) : cards);
};

export const vocabulary = async (req, res) => {
  const { shuffled = "false", starred = null } = req.query;
  const cards = await Card.find({ category: "Vocabulary" });
  if (starred === "true") {
    const starredIDs = await Users.findOne({ email: req.user.email }).select("starredCards").starredCards;
    const starredCards = cards.filter(card => starredIDs.includes(card.id));
    return res.json(shuffled === "true" ? shuffle(starredCards) : starredCards);
  }
  return res.json(shuffled === "true" ? shuffle(cards) : cards);
};

export const star = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Card ID is required" });
  }
  const user = await Users.findOne({ email: req.user.email });
  if (req.method === "POST") {
    if (!user.starredCards.includes(parseInt(id))) user.starredCards.push(parseInt(id));
    await user.save();
    return res.json({ message: `Card with ID ${id} starred` });
  } else if (req.method === "DELETE") {
    user.starredCards.pop(user.starredCards.indexOf(parseInt(id)));
    await user.save();
    return res.json({ message: `Card with ID ${id} unstarred` });
  }
};