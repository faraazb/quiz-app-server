const express = require("express");
const { sendResponse } = require("../helpers/response");
const { Quiz } = require("../models");

const router = express.Router();

router.get("/", async (req, res, next) => {
    try{
        const quizzes = await Quiz.find({}).populate("submissionsCount");
        sendResponse(req, res, {data: quizzes});
    }
    catch(err)   {
        console.log(err);
        next(err);
    }
});

module.exports = router;
