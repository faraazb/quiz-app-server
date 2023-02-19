const express = require("express");
const { sendResponse } = require("../helpers/response");
const { Quiz } = require("../models");

const router = express.Router();

router.get("/", async (req, res, next) => {
    try{
        const quizzes = await Quiz.find({}).populate("submissionsCount");
        // console.log(quizzes[0].submissionsCount);
        // const x = await Quiz.populate(quizzes, {path: "submissionsCount"});
        // console.log(x);

        // console.log("All quizzes", quizzes);
        // const result=quizzes.map((quiz) => {
        //     return {...quiz, submissionsCount: quiz.submissionsCount};
        // })
        sendResponse(req, res, {data: quizzes});
    }
    catch(err)   {
        console.log(err);
        next(err);
    }
});

module.exports = router;
