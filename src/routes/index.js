const express = require("express");
const { sendResponse } = require("../helpers/response");
const usersRouter = require("./users.routes");
const quizzesRouter = require("./quizzes.routes");
const questionsRouter = require("./questions.routes");

const indexRouter = express.Router();

indexRouter.get("/", (req, res) => {
    sendResponse(req, res, { message: "ok" });
});

module.exports = {
    indexRouter,
    usersRouter,
    quizzesRouter,
    questionsRouter,
};
