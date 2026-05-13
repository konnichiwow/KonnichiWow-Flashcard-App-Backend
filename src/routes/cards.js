import express from "express";
import {
  kanji,
  vocabulary,
  starCard,
  unstarCard,
  createBulkJLPTLevels
} from "../controllers/Cards.controller.js";

const router = express.Router();

/**
 * @route   GET /api/cards/kanji
 * @desc    Fetch all Kanji cards
 * @query   shuffled (optional) - "true" or "false" to shuffle the cards
 *          starred (optional) - "true" to return only starred cards
 * @access  Public
 */
router.get("/kanji", kanji);

/**
 * @route   GET /api/cards/vocabulary
 * @desc    Fetch all Vocabulary cards
 * @query   shuffled (optional) - "true" or "false" to shuffle the cards
 *          starred (optional) - "true" to return only starred cards
 * @access  Public
 */
router.get("/vocabulary", vocabulary);

/**
 * @route   POST /api/cards/star
 * @desc    Star a card (sets isStarred = true)
 * @body    level - JLPT level (N1-N5)
 *          deckType - "Kanji" or "Vocabulary"
 *          lessonNumber - lesson number
 *          moduleNumber - module number (required for Vocabulary only)
 *          cardNumber - the card number to star
 * @access  Protected (user should be authenticated)
 */
router.post("/star", starCard);

/**
 * @route   POST /api/cards/unstar
 * @desc    Unstar a card (sets isStarred = false)
 * @body    level - JLPT level (N1-N5)
 *          deckType - "Kanji" or "Vocabulary"
 *          lessonNumber - lesson number
 *          moduleNumber - module number (required for Vocabulary only)
 *          cardNumber - the card number to unstar
 * @access  Protected (user should be authenticated)
 */
router.post("/unstar", unstarCard);

/**
 * @route   POST /api/jlpt-levels/bulk
 * @desc    Add multiple JLPTLevel documents in a single request.
 * @access  Public
 *
 * @body    An array of JLPTLevel objects.
 *
 * @example_payload
 * [
 * {
 * "level": "N5",
 * "decks": [ { "type": "Vocabulary", "lessons": [] } ]
 * },
 * {
 * "level": "N4",
 * "decks": [ { "type": "Kanji", "lessons": [] } ]
 * }
 * ]
 */

router.post("/bulk", createBulkJLPTLevels);

export default router;
