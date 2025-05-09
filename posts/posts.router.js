const { Router } = require("express");
const postsModel = require("../models/posts.model");
const { isValidObjectId } = require("mongoose");

const postRouter = Router()

postRouter.get('/', async (req, res) => {
    const posts = await postsModel
        .find()
        .sort({ _id: -1 })
        .populate({ path: 'author', select: 'fullName email' })


    res.status(200).json(posts)
})

postRouter.post('/', async (req, res) => {
    const {content} = req.body
    if(!content) {
        return res.status(400).json({message:'content it requred'})
    }

    await postsModel.create({content, author: req.userId})
    res.status(201).json({message: "post created successfully"})
})

postRouter.delete('/:id', async (req, res) => {
    const {id} = req.params
    if(!isValidObjectId(id)){
        return res.status(400).json({message: "id is invalid"})
    }

    const post = await postsModel.findById(id)

    if(post.author.toString() !== req.userId){
        return res.status(401).json({message: 'you dont have permition'})
    }

    await postsModel.findByIdAndDelete(id)
    res.status(200).json({message: "post deleted successfully"})
})

postRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: "Content is required" });
    }

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "ID is invalid" });
    }

    const post = await postsModel.findById(id);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.userId) {
        return res.status(401).json({ message: "You don’t have permission to edit this post" });
    }

    post.content = content;
    await post.save();
    res.status(200).json({ message: "Post updated successfully" });
});
postRouter.put('/like/:id', async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "ID is invalid" });
    }

    const post = await postsModel.findById(id);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes && post.likes.includes(req.userId)) {
        return res.status(400).json({ message: "You have already liked this post" });
    }

    post.likes = post.likes || [];
    post.likes.push(req.userId);
    await post.save();

    res.status(200).json({ message: "Post liked successfully", likes: post.likes.length });
});

postRouter.get('/search/:id', async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "ID is invalid" });
    }

    const post = await postsModel.findById(id).populate({ path: 'author', select: 'fullName email' });

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
});

module.exports = postRouter