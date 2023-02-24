const { body, validationResult, param } = require("express-validator");
const AppError = require("./error");

// useful for one-off fields with validate([])
function required(fields) {
    return body(fields).not().isEmpty().withMessage("this field is required");
}

// useful for entire schema validation
const isRequired = {
    in: ["body"],
    isEmpty: {
        negated: true,
        bail: true,
        errorMessage: "this field is required",
    },
};

// sequential processing, stops running validations chain if the previous one have failed.
const validate = (validations) => {
    return async (req, res, next) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (result.errors.length) break;
        }

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        const fieldErrors = errors
            .array()
            .map(({ msg, param }) => ({ field: param, error: msg }));
        next(
            new AppError({
                statusCode: 400,
                message: "failure",
                hints: fieldErrors,
            })
        );
    };
};

function isMongoId(field, name) {
    return param(field)
        .isMongoId()
        .withMessage(`invalid ${name ? name + " " : ""}id`);
}

module.exports = {
    validate,
    required,
    isRequired,
    isMongoId,
};
