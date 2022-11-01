const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String,
    password: String,
    position: Number,
    subject: Number
})

module.exports = mongoose.model('user', userSchema)