const mongoose = require('mongoose');
const validator = require('validator');

//defining a model
const FriendsAnswers = mongoose.model('FriendsAnswers', { //constructer function for that model
    friendName: {
        type: String,
        required: true,
        trim: true,
    },
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        default: "my home",
    },
    answers: {
        type: Array,
        required: true,
    }
})

module.exports = FriendsAnswers