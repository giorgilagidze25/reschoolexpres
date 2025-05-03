const { default: mongoose } = require("mongoose");

const postShema = new mongoose.Schema({
    content: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
    }
}, {timestamps: true})

module.exports = mongoose.model('post', postShema)