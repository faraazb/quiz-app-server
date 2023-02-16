const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        settings: {
            default_points: {
                type: Number,
                default: 1,
            },
        },
        report: {
            type: Schema.Types.ObjectId,
            ref: "Report",
        },
    },
    {
        timestamps: true,
    }
);

schema.virtual("questions", {
    ref: "Question",
    localField: "_id",
    foreignField: "quiz",
});

schema.virtual("submissions", {
    ref: "Submission",
    localField: "_id",
    foreignField: "quiz",
});

// need to check - this could be faster than
// getting the submissions and checking length
// manually
schema.virtual("submissionsCount", {
    ref: "Submission",
    localField: "_id",
    foreignField: "quiz",
    count: true,
});

const Quiz = mongoose.model("Quiz", schema);

module.exports = Quiz;
