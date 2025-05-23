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

    const updatedUser = await usersModel.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedUser); 
  } catch (error) {
    console.error('Error updating user:', error); 
    res.status(500).json({ message: 'User update failed', error: error.message });
  }
});


module.exports= userRouter