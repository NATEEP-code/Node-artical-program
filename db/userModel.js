const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    username:String,
    password:String,
    creatTime:Number
})

let userModel = mongoose.model('users',userSchema)

module.exports = userModel;