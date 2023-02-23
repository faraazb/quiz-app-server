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
        if(Object.keys(question).length !== 0)    {
            sendResponse(req, res, { data: question });
            return;
        }
        return res.status(404).json({
            message: "Question not found",
        })
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports = router;