const { Router } = require("express");
const postsModel = require("../models/posts.model");
const usersModel = require("../models/users.model");
const { isValidObjectId } = require("mongoose");
const isAuth = require("../midelwear/isAuth.midelwear");
const uploads = require("../config/claudinary.config");

const postRouter = Router();
postRouter.post('/', isAuth, uploads.single('image'), async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const image = req.file?.path || '';

        const newPost = await postsModel.create({ content, author: req.userId, image });

        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});



postRouter.get('/', async (req, res) => {
    const posts = await postsModel
        .find()
        .sort({ _id: -1 })
        .populate({ path: 'author', select: 'fullName email' });

    res.status(200).json(posts);
});

postRouter.delete('/:id', isAuth, async (req, res) => {
    const postId = req.params.id;
    const post = await postsModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const currentUserId = req.userId;
    const currentUser = await usersModel.findById(currentUserId);

    const isOwner = post.author.toString() === currentUserId;
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "You don't have permission" });
    }

    await postsModel.findByIdAndDelete(postId);
    res.json({ message: "Post deleted" });
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
        return res.status(403).json({ message: "You don't have permission to edit this post" });
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
postRouter.post('/:id/comment', isAuth, uploads.single('image'), async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const image = req.file?.path || '';

    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const post = await postsModel.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ text, author: req.userId, image });
    await post.save();

    res.status(201).json({ message: "Comment added successfully", post });
});

postRouter.post('/:id/like', isAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    const post = await postsModel.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.dislikes = post.dislikes.filter(uid => uid.toString() !== userId);

    if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(uid => uid.toString() !== userId);
        await post.save();
        return res.status(200).json({ message: "Like removed", likes: post.likes.length, dislikes: post.dislikes.length });
    } else {
        post.likes.push(userId);
        await post.save();
        return res.status(200).json({ message: "Post liked", likes: post.likes.length, dislikes: post.dislikes.length });
    }
});

postRouter.post('/:id/dislike', isAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    const post = await postsModel.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likes = post.likes.filter(uid => uid.toString() !== userId);

    if (post.dislikes.includes(userId)) {
        post.dislikes = post.dislikes.filter(uid => uid.toString() !== userId);
        await post.save();
        return res.status(200).json({ message: "Dislike removed", likes: post.likes.length, dislikes: post.dislikes.length });
    } else {
        post.dislikes.push(userId);
        await post.save();
        return res.status(200).json({ message: "Post disliked", likes: post.likes.length, dislikes: post.dislikes.length });
    }
});

module.exports = postRouter;
