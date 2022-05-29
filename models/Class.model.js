const mongoose = require("mongoose");

const Class = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    startTime: {
        type: Number,
        required: true,
    },
    endTime: {
        type: Number,
        required: true,
    },
})

const model = mongoose.model("Class", Class);
module.exports = model;