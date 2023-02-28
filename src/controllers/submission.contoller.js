const {
    Submission,
    Report,
    Question,
    Option,
    User,
    Quiz,
} = require("../models");
async function getSubmissionById(id) {
    return await Submission.findById({ _id: id }).select([
        "-__v",
        "-createdAt",
        "-updatedAt",
    ]);
}
function getScore(type, totalPoints, questionOptions, selectedOptions) {
    let score = 0;
    if (type === "multiple_ans") {
        let count = 0;
        let totalCorrectOptions = 0;
        for (let op of questionOptions) {
            if (op.isCorrect) totalCorrectOptions = totalCorrectOptions + 1;
        }
        if (!totalCorrectOptions) return 0;
        const filterOptions = questionOptions.filter((option) => {
            return selectedOptions.includes(option._id.toString());
        });
        for (let op of filterOptions) {
            if (op.isCorrect) {
                count = count + 1;
            }
        }
        score = count * (totalPoints / totalCorrectOptions);
    } else {
        const filterOptions = questionOptions.filter((option) => {
            return selectedOptions.includes(option._id.toString());
        });
        const result = filterOptions.some((option) => {
            return option.isCorrect;
        });
        if (result) score = score + totalPoints;
    }
    return score;
}
async function create(quizId, submissionData) {
    const { questions, username } = submissionData;
    //create user
    const user = new User({ username });
    await user.save();
    //object for saving in submissions
    const selectedOptionsToSave = [];
    let score = 0;
    let correctlyAnsweredCount = 0;
    for (let question of questions) {
        const { _id, selectedOptions } = question;
        const quizQuestion = await Question.findById(_id);
        const { points, type } = quizQuestion;
        const options = await Option.find({ question: _id });
        selectedOptionsToSave.push({
            question: _id,
            options: selectedOptions,
        });
        const currScore = getScore(type, points, options, selectedOptions);
        if (currScore > 0) correctlyAnsweredCount++;
        score += currScore;
    }
    const submission = new Submission({
        quiz: quizId,
        user,
        score,
        selectedOptions: selectedOptionsToSave,
        correctlyAnsweredCount,
    });
    await submission.save();
    const quiz = await Quiz.findById(quizId).populate([
        { path: "report", model: "Report" },
        { path: "submissionsCount" },
    ]);
    const { report } = quiz;
    const { submissionsCount } = quiz;
    const { statistics } = report;
    const { averageScore, highestScore } = statistics;
    statistics.averageScore =
        (averageScore * (submissionsCount - 1) + score) / submissionsCount;
    if (score > highestScore) {
        statistics.highestScore = score;
    }
    await Report.updateOne({ _id: report._id }, { statistics });
    return submission._id;
}
module.exports = {
    getSubmissionById,
    create,
};
