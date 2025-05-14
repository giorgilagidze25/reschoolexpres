const { Router } = require("express");
const postsModel = require("../models/posts.model");
const usersModel = require("../models/users.model");
const { isValidObjectId } = require("mongoose");
const isAuth = require("../midelwear/isAuth.midelwear");

const postRouter = Router();

postRouter.get('/', async (req, res) => {
    const posts = await postsModel
        .find()
        .sort({ _id: -1 })
        .populate({ path: 'author', select: 'fullName email' });

    res.status(200).json(posts);
});

postRouter.post('/', isAuth, async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'content is required' });
    }

    await postsModel.create({ content, author: req.userId });
    res.status(201).json({ message: "post created successfully" });
});

postRouter.delete('/:id', isAuth, async (req, res) => {
    const postId = req.params.id;

    const post = await postsModel.findById(postId);
    if (!post) return res.status(404).json({ message: "post not found" });

    const currentUserId = req.userId;
    const currentUser = await usersModel.findById(currentUserId);

    const isOwner = post.author.toString() === currentUserId;
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "you don't have permission" });
    }

    await postsModel.findByIdAndDelete(postId);
    res.json({ message: "post deleted" });
});

postRouter.put('/:id', isAuth, async (req, res) => {
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

    const currentUserId = req.userId;
    const currentUser = await usersModel.findById(currentUserId);

    const isOwner = post.author.toString() === currentUserId;
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "You don t have permission to edit this post" });
    }

    post.content = content;
    await post.save();

    res.status(200).json({ message: "Post updated successfully" });
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

module.exports = postRouter;
