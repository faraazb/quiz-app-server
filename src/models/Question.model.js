const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
    {
        text: {
            type: String,
            required: true,
        },
        points: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ["single_ans", "multiple_ans"],
        },
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

schema.virtual("options", {
    ref: "Option",
    localField: "_id",
    foreignField: "question",
});

const Question = mongoose.model("Question", schema);

module.exports = Question;
