class AppError extends Error {
    constructor({ err, statusCode = 500, message = "failure", hints }) {
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.reason = err;
        this.hints = hints;
    }
}

module.exports = AppError;
