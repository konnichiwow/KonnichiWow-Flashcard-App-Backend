import Card from "../models/Card.js";
//import User from "../models/User.js";

const shuffle = (arr) => {
  return arr;
};

export const kanji = async (req, res) => {
  const { shuffled = "false", starred = null } = req.query;
  const cards = await Card.find({ category: "Kanji" });
  if (starred === "true") {
    const starredIDs = await User.findOne({ id: req.user.id }).select("starredCards").starredCards;
    // User model doesn't exist yet, but I guess this is how the starred cards' IDs would be fetched
    const starredCards = cards.filter(card => starredIDs.includes(card.id));
    return res.json(shuffled === "true" ? shuffle(starredCards) : starredCards);
  }
  return res.json(shuffled === "true" ? shuffle(cards) : cards);
};

export const vocabulary = async (req, res) => {
    const { shuffled = "false", starred = null } = req.query;
    const cards = await Card.find({ category: "Vocabulary" });
    if (starred === "true") {
        const starredIDs = await User.findOne({ id: req.user.id }).select("starredCards").starredCards;
        // User model doesn't exist yet
        const starredCards = cards.filter(card => starredIDs.includes(card.id));
        return res.json(shuffled === "true" ? shuffle(starredCards) : starredCards);
    }
    return res.json(shuffled === "true" ? shuffle(cards) : cards);
};