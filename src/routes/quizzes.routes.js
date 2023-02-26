const express = require("express");
const {
    validate,
    required,
    isMongoId,
    paramRequired,
} = require("../helpers/validation");
const { quizzesController, questionsController } = require("../controllers");
const { sendResponse } = require("../helpers/response");

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const quizzes = await quizzesController.list();
        sendResponse(req, res, { data: quizzes });
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.get("/:id", validate([isMongoId("id", "quiz")]), async (req, res, next) => {
    try {
        const {
            params: {id}
        } = req;
        const quiz = await quizzesController.getQuizById(id);
        if(Object.keys(quiz).length !== 0) {
            sendResponse(req, res, { data: quiz });
            return;
        }
        return res.status(404).json({
            message: "Quiz not found",
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});

router.get("/:id/questions", async (req, res, next) => {
    try {
        const {
            params: { id },
        } = req;
        const questionIds = await questionsController.list(id);
        if (Object.keys(questionIds).length !== 0) {
            sendResponse(req, res, { data: questionIds });
            return;
        }
        return res.status(404).json({
            message: "Quiz not found",
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.post(
    "/",
    validate([
        required(["title", "description"]),
        ...quizzesController.validateQuestions,
    ]),
    async (req, res, next) => {
        try {
            const { title, description, settings, questions } = req.body;
            const quizId = await quizzesController.create({
                title,
                description,
                questions,
                settings,
            });
            sendResponse(req, res, { data: { id: quizId } });
        } catch (err) {
            console.log(err);
            next(err);
        }
    }
);

router.put(
    "/:id",

    validate([
        paramRequired(["id"]),
        isMongoId("id", "quiz"),
        ...quizzesController.validateQuestions,
    ]),
    async (req, res, next) => {
        try {
            const { title, description, settings, questions } = req.body;
            const {
                params: { id },
            } = req;
            const quizId = await quizzesController.updateQuiz(
                id,
                title,
                description,
                settings,
                questions
            );
            sendResponse(req, res, { data: { id: quizId } });
        } catch (err) {
            next(err);
        }
    }
);

router
    .route("/:id/submissions")
    .get(
        validate([isMongoId("id", "quiz")]),
        quizzesController.getSubmissionsAndStats
    );

module.exports = router;
