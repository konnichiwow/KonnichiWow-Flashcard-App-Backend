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
  phoneNumber: {
    countryCode:{
      type:String,
    },
    phoneNumber:{
      type:String,
    }
  },
  starredCards: {
    type: [Number],
    default: [],
  },
});

const Users = mongoose.models.Users || mongoose.model("Users", userSchema);

export default Users;
