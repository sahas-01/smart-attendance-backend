const mongoose = require("mongoose");

const User = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    contact: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    registerNo: {
        type: String,
        required: true,
    },
})

const model = mongoose.model("User", User);
module.exports = model;
