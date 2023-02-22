const express = require("express");
const { sendResponse } = require("../helpers/response");
const router = express.Router();
const { Question } = require("../models");
const { questionsController } = require("../controllers");

router.get("/:questionId", async (req, res, next) => {
    try {
        const {
            params: {questionId}
        } = req;
        const question = await questionsController.getQuestionById(questionId);
        sendResponse(req, res, { data: question });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports = router;