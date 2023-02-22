const express = require("express");
const { quizzesController } = require("../controllers");
const { validate, required } = require("../helpers/validation");
const { sendResponse } = require("../helpers/response");


const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const quizzes = await quizzesController.list();
        sendResponse(req, res, { data: quizzes });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});

router.post("/", validate([
    required([
        "title", "description"
    ]),
    ...quizzesController.validateQuestions
]), async (req, res, next) => {
    try {
        const { title, description, settings, questions } = req.body;
        const quizId = await quizzesController.create({title, description, questions, settings});
        sendResponse(req, res, { data: {id: quizId} })
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports = router;
