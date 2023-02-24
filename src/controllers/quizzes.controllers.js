const { checkSchema } = require("express-validator");
const { Quiz, Question, Option, Report, Submission } = require("../models");
const { isRequired } = require("../helpers/validation");
const { sendResponse } = require("../helpers/response");
const AppError = require("../helpers/error");

async function list() {
    return await Quiz.find({}).populate("submissionsCount");
}

async function create({ title, description, questions: quests, settings }) {
    const quiz = new Quiz({ title, description });
    if (settings) {
        const { defaultPoints } = settings;
        quiz.settings.defaultPoints = defaultPoints;
    }
    const questions = await Promise.all(
        quests.map(async ({ text, points, options, type }) => {
            const question = new Question({
                text,
                points: points || quiz.settings.defaultPoints,
                quiz,
                type,
            });
            // first insert all options
            const opts = await Option.insertMany(
                options.map((option) => ({ ...option, question: question }))
            );
            question.options = opts;
            // then return the question saving promise for Promise.all()
            return question.save();
        })
    );
    // attach the saved questions to the quiz
    quiz.questions = questions;
    // attach a newly created and saved report instance to the quiz
    const report = await new Report().save();
    quiz.report = report;
    // finally, save the quiz instance
    await quiz.save();
    return quiz.id;
}
async function getSubmissionsAndStats(req, res, next) {
    //get quiz id from params
    const {
        params: { id },
    } = req;
    const result = {};
    //Queries used for projection
    const reportQuery = { statistics: true };
    const submissionQuery = { score: true };
    const userQuery = { username: true };
    try {
        //find report
        const report = await Quiz.findById(id, { report: 1 }).populate(
            "report",
            reportQuery
        );
        //If report not found raise error
        if (!report) {
            const err = new AppError({
                err: new Error("Data not found"),
                statusCode: 404,
                message: "Data not found",
                hints: "Check quiz id",
            });
            throw err;
        }
        //Add report to result
        result["report"] = report.report;
        //Find submissions
        const submissions = await Submission.find(
            { quiz: id },
            submissionQuery
        ).populate("user", userQuery);

        //Add submissions to result
        result["submissions"] = submissions;

        //Send response
        sendResponse(req, res, {
            data: result,
        });
    } catch (err) {
        next(err);
    }
}
const validateQuestions = checkSchema({
    questions: {
        ...isRequired,
        isArray: {
            bail: true,
        },
    },
    "questions.*.text": {
        ...isRequired,
    },
    "questions.*.type": {
        ...isRequired,
    },
    "questions.*.points": {
        optional: true,
        isInt: true,
        toInt: true,
    },
    "questions.*.options": {
        ...isRequired,
        isArray: {
            bail: true,
        },
    },
    "questions.*.options.*.text": {
        ...isRequired,
    },
    "questions.*.options.*.isCorrect": {
        ...isRequired,
        isBoolean: true,
    },
});

module.exports = {
    list,
    create,
    validateQuestions,
    getSubmissionsAndStats,
};
