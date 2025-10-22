import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  isProfileComplete: Boolean,
  phoneNumber: String,
  starredCards: {
    type: [Number],
    default: [],
  },
});

// ✅ Fix: reuse existing model if already compiled
const Users = mongoose.models.Users || mongoose.model("Users", userSchema);

export default Users;
