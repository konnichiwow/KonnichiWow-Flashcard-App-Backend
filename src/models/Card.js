import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ["Kanji", "Vocabulary"]
    }
});

const Card = mongoose.model("Card", cardSchema);
export default Card;