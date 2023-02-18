const express = require("express");
const { sendErrorResponse } = require("./helpers/response");
const { indexRouter, usersRouter } = require("./routes");

const app = express();
app.use(express.json());

// routes
app.use("/", indexRouter);
app.use("/users", usersRouter);

// error handling
app.use(sendErrorResponse);

module.exports = app;
