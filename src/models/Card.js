import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  cardNumber: { type: Number, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  isStarred: { type: Boolean, default: false }, 
});

const moduleSchema = new mongoose.Schema({
  moduleNumber: { type: Number, required: true },
  cards: [cardSchema],
});

const lessonSchema = new mongoose.Schema({
  lessonNumber: { type: Number, required: true },
  modules: [moduleSchema],
  kanjiCards: [cardSchema],
});

const deckSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["Kanji", "Vocabulary"],
  },
  lessons: [lessonSchema],
});

const jlptLevelSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ["N1", "N2", "N3", "N4", "N5"],
    unique: true,
  },
  decks: [deckSchema],
});

const JLPTLevel = mongoose.model("JLPTLevel", jlptLevelSchema);
export default JLPTLevel;
