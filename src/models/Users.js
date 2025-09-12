import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  starredCards: {
    type: [Number],
    default: []
  }
});

export default mongoose.model("Users", userSchema);