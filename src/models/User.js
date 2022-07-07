const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 3,
        max: 1024
    },
    password: {
        type: String,
        required: true,
        minlength: 3
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Usuarios', userSchema);