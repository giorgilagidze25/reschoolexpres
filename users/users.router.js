const { Router } = require("express");
const usersModel = require("../models/users.model");
const uploads = require("../config/claudinary.config");
const isAuth = require("../midelwear/isAuth.midelwear");

const userRouter = Router()

userRouter.get('/', async (req, res) => {
   const users = await usersModel.find().sort({_id: -1})
   res.status(200).json(users)
})
userRouter.put('/', isAuth, uploads.single('avatar'), async (req, res) => {
  try {
    const id = req.userId;
    const { email } = req.body;

    const updateData = { email };
    if (req.file?.path) {
      updateData.avatar = req.file.path;
    }

    await usersModel.findByIdAndUpdate(id, updateData);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error); // ეს დაალოგავს რეალურ შეცდომას
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports= userRouter