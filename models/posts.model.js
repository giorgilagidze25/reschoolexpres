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
        image: {
        type: String,
        default: ''
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],

     comments: [
    {
      text: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      image: {
        type: String,
        default: ''
      },
     
    }
  ]
}, {timestamps: true})

module.exports = mongoose.model('post', postShema)