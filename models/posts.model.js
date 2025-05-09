const { default: mongoose } = require("mongoose");

const postShema = new mongoose.Schema({
    content: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
    },
       likes: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

module.exports = mongoose.model('post', postShema)