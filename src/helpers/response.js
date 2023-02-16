const AppError = require("./error");

const sendResponse = (req, res, payload) => {
    const { statusCode = 200, message = "success", data } = payload;
    let response = { message };
    if (data) {
        response.data = data;
    }
    res.status(statusCode).json(response);
};

const sendErrorResponse = (error, req, res, next) => {
    if (error instanceof AppError) {
        const { statusCode = 500, message = "failure", hints } = error;
        let response = { message };
        if (hints) {
            response.errors = hints;
        }
        res.status(statusCode).json(response);
    } else {
        console.log(error);
        res.status(500).json({ message: "server error" });
    }
};

module.exports = { sendResponse, sendErrorResponse };
