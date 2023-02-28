const { checkSchema } = require("express-validator");
const { Quiz, Report, Submission, Question } = require("../models");
const questionsController = require("./questions.controller");
const { isRequired } = require("../helpers/validation");
const { sendResponse } = require("../helpers/response");
const AppError = require("../helpers/error");

async function list() {
    return await Quiz.find({}).populate("submissionsCount");
}

async function getQuizById(id) {
    return await Quiz.find({ _id: id }).populate({
        path: "questions",
        populate: "options",
    });
}

async function create({ title, description, questions: quests, settings }) {
    const quiz = new Quiz({ title, description });
    if (settings) {
        const { defaultPoints } = settings;
        quiz.settings.defaultPoints = defaultPoints;
    }
    if (quests && quests.length > 0) {
        // create and attach the saved questions to the quiz
        const { questions, totalPoints } = await questionsController.createMany(
            quests
        );
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
async function updateQuiz(id, title, description, settings, questionsData) {
    const quiz = await Quiz.findById(id);

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

    //Update title if given
    if (title) {
        quiz.title = title;
    }
    //Update description if given
    if (description) {
        quiz.description = description;
    }
    //Update settings if given
    if (settings) {
        const { defaultPoints } = settings;
        quiz.settings.defaultPoints = defaultPoints;
    }
    if (questionsData && questionsData.length > 0) {
        // create and attach the saved questions to the quiz
        const { questions, totalPoints } = await questionsController.updateMany(
            quiz,
            questionsData
        );
        quiz.questions = questions;
        quiz.totalPoints = totalPoints;
        let allQuizQuestions = await Question.find({ quiz: quiz._id }, "_id");
        allQuizQuestions = allQuizQuestions.map((question) => question.id);
        const addedQuestionsIds = questions.map((question) => question.id);
        const questionsToRemove = allQuizQuestions.filter((question) => {
            return !addedQuestionsIds.includes(question);
        });
        await Question.deleteMany({ _id: { $in: questionsToRemove } });
    }
    //finally save quiz
    await quiz.save();
    return quiz._id;
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
        totalPoints: true,
    };
    const reportQuery = { statistics: true };
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
        const { title, description, totalPoints, report } = quiz;
        result["quiz"] = { title, description, totalPoints };
        result["report"] = report;
        //Find submissions
        const submissions = await Submission.find({ quiz: id })
            .populate("user", userQuery)
            .select(["score", "correctlyAnsweredCount"]);

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
    updateQuiz,
    getQuizById,
};
