const mongoose = require('mongoose');
const validator = require('validator');

//defining a model
const Question = mongoose.model('Question', { //constructer function for that model
    question: {
        type: String,
        required: true,
        trim: true,
    },
    answers: {
        type: Array,
        required: true, 
        validate(value) {
            if (value.length !== 4 ) {
                throw new Error ("every question must have 4 possible answers")
            }
        }
    }
})

module.exports = Question