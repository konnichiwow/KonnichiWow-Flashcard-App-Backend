import Users from "../models/Users.js";
import Card from "../models/Card.js";

export const stars = async (req, res) => {
    const user = await Users.findOne({ email: req.user.email });
    const starredIDs = user.starredCards;
    const starredCards = await Card.find({ id: { $in: starredIDs } });
    return res.json(starredCards);
};