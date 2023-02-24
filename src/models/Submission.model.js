const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
    {
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        score: {
            type: Number,
            default: 0
        },
        selectedOptions: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true,
                },
                options: [
                    { type: mongoose.Schema.Types.ObjectId, ref: "Option", required: true, },
                ],
            },
        ],
        correctlyAnsweredCount: {
            type: Number
        }
    },
    {
        timestamps: true,
    }
);

const Submission = mongoose.model("Submission", schema);

module.exports = Submission;
