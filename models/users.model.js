const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String
    },
    email: {
        type: String,
        require: true,
        lowercase: true
    },
    password:{
    type: String,
    require: true,
    select: false
    },
      avatar: { type: String,  default: 'default.png' },
    posts:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'post',
        default: []
    }

})


module.exports = mongoose.model('user', userSchema)