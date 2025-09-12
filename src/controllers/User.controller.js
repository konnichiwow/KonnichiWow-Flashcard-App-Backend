//import User from "../models/User.js";

export const stars = async (req, res) => {
    const user = await User.findOne({ id: req.user.id });
    const starredIDs = user.starredCards;
    const starredCards = await Card.find({ id: { $in: starredIDs } });
    return res.json(starredCards);
};