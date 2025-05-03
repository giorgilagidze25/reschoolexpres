const { Router } = require("express");
const postsModel = require("../models/posts.model");
const isAuth = require("../midelwear/isAuth.midelwear");
const { isValidObjectId } = require("mongoose");

const postRouter = Router()


postRouter.get('/', async (req, res) => {
    const posts = await postsModel.find().sort({_id: -1}).populate({path: "author", select: "fullName email"})
    res.status(200).json(posts)
})

postRouter.post('/', async (req, res) => {
    const  {content} = req.body
   if(!content){
    return res.status(400).json({message: "connot it requaier"})
    
   }
    await postsModel.create({conntent, author:req.userId})
    res.status(201).json({message: 'created'})
})


postRouter.delete('/:id',  async (req, res) => {
    const {id} = req.params
    if(!isValidObjectId(id)){
      return res.status(400).json({message: "id is valid"})
    }
    
    const post = await postsModel.findById(id)
    
    if(post.author.toString() !== req.userId){
        return res.status(401),json({message: 'you dont have permition'})
    }

    await postsModel.findByIdAndDelete(id)
    res.status(200).json({message:'post delete succsesfyl'})
});


module.exports = postRouter