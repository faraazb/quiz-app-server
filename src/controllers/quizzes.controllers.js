const { checkSchema } = require("express-validator");
const { Quiz, Report, Submission } = require("../models");
const questionsController = require("./questions.controller");
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
    if (quests && quests.length > 0) {
        // create and attach the saved questions to the quiz
        const { questions, totalPoints } = await questionsController.createMany(quests);
        quiz.questions = questions;
        quiz.totalPoints = totalPoints;
    }
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
    const quizQuery = {
        _id: false,
        title: true,
        description: true,
    };
    const reportQuery = { statistics: true };
    const submissionQuery = { _id: false, score: true };
    const userQuery = { username: true };
    try {
        //find report
        const quiz = await Quiz.findById(id, quizQuery).populate(
            "report",
            reportQuery
        );
        //If quiz not found raise error
        if (!quiz) {
            const err = new AppError({
                err: new Error("Data not found"),
                statusCode: 404,
                message: "Data not found",
                hints: "Check quiz id",
            });
            throw err;
        }
        //Add quiz to result
        const { title, description, report } = quiz;
        result["quiz"] = { title, description };
        result["report"] = report;
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
        optional: true,
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
