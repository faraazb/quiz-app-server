const express = require("express");
const { sendErrorResponse } = require("./helpers/response");
const { indexRouter, usersRouter, quizzesRouter } = require("./routes");
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
// routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/quizzes", quizzesRouter);
// error handling
app.use(sendErrorResponse);

module.exports = app;
