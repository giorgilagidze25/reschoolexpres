const { Router } = require("express");
const postsModel = require("../models/posts.model");
const usersModel = require("../models/users.model");
const { isValidObjectId } = require("mongoose");
const isAuth = require("../midelwear/isAuth.midelwear");
const uploads = require("../config/claudinary.config");

const postRouter = Router();
postRouter.get('/', async (req, res) => {
  try {
    const sortType = req.query.type;

    // Default sorting - ახალი პოსტები პირველ რიგში
    let sortCriteria = { createdAt: -1 };

    if (sortType === 'most') {
      // პოპულარობის მიხედვით კლებადობით (ლაიქები - დისლაიქები)
      sortCriteria = { popularityScore: -1 };
    } else if (sortType === 'least') {
      // პოპულარობის მიხედვით ზრდადობით
      sortCriteria = { popularityScore: 1 };
    }

    const posts = await postsModel.aggregate([
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ['$likes', []] } },
          dislikesCount: { $size: { $ifNull: ['$dislikes', []] } },
        },
      },
      {
        $addFields: {
          popularityScore: { $subtract: ['$likesCount', '$dislikesCount'] },
        },
      },
      {
        $sort: sortCriteria,
      },
    ]);

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


postRouter.delete('/:id', isAuth, async (req, res) => {
  try {
    const postId = req.params.id;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await postsModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const currentUser = await usersModel.findById(req.userId);
    const isOwner = post.author.toString() === req.userId;
    const isAdmin = currentUser?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You don't have permission to delete this post" });
    }

    await postsModel.findByIdAndDelete(postId);
    res.json({ message: "Post deleted" });

  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE post by ID (auth required)
postRouter.put('/:id', isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: "Content is required" });
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid ID" });

    const post = await postsModel.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const currentUser = await usersModel.findById(req.userId);
    const isOwner = post.author.toString() === req.userId;
    const isAdmin = currentUser?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You don't have permission to edit this post" });
    }

    post.content = content;
    await post.save();

    res.status(200).json({ message: "Post updated successfully" });

  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single post by ID
postRouter.get('/search/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const post = await postsModel.findById(id).populate({
      path: 'author',
      select: 'fullName email'
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);

  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ADD comment to post (auth required)
postRouter.post('/:id/comment', isAuth, uploads.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const image = req.file?.path || '';

    if (!text) return res.status(400).json({ message: "Comment text is required" });

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await postsModel.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ text, author: req.userId, image });
    await post.save();

    res.status(201).json({ message: "Comment added successfully", post });

  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LIKE post (auth required)
postRouter.post('/:id/like', isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await postsModel.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Remove userId from dislikes if exists
    post.dislikes = post.dislikes.filter(uid => uid.toString() !== userId);

    if (post.likes.includes(userId)) {
      // If already liked, remove like
      post.likes = post.likes.filter(uid => uid.toString() !== userId);
      await post.save();
      return res.status(200).json({
        message: "Like removed",
        likes: post.likes.length,
        dislikes: post.dislikes.length
      });
    } else {
      // Add like
      post.likes.push(userId);
      await post.save();
      return res.status(200).json({
        message: "Post liked",
        likes: post.likes.length,
        dislikes: post.dislikes.length
      });
    }

  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DISLIKE post (auth required)
postRouter.post('/:id/dislike', isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await postsModel.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Remove userId from likes if exists
    post.likes = post.likes.filter(uid => uid.toString() !== userId);

    if (post.dislikes.includes(userId)) {
      // If already disliked, remove dislike
      post.dislikes = post.dislikes.filter(uid => uid.toString() !== userId);
      await post.save();
      return res.status(200).json({
        message: "Dislike removed",
        likes: post.likes.length,
        dislikes: post.dislikes.length
      });
    } else {
      // Add dislike
      post.dislikes.push(userId);
      await post.save();
      return res.status(200).json({
        message: "Post disliked",
        likes: post.likes.length,
        dislikes: post.dislikes.length
      });
    }

  } catch (err) {
    console.error('Error disliking post:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = postRouter;
