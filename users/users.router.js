const { Router } = require("express");
const usersModel = require("../models/users.model");
const uploads = require("../config/claudinary.config");
const isAuth = require("../midelwear/isAuth.midelwear");

const userRouter = Router()

userRouter.get('/', async (req, res) => {
   const users = await usersModel.find().sort({_id: -1})
   res.status(200).json(users)
})

userRouter.put('/:id', isAuth, uploads.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params; 
    const { email, fullName } = req.body;

    if (email) {
      const existingUser = await usersModel.findOne({ email });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ message: 'Email already exists for another user' });
      }
    }

    const updateData = {};
    if (email) updateData.email = email;
    if (fullName) updateData.fullName = fullName;
    if (req.file?.path) updateData.avatar = req.file.path;

    const updatedUser = await usersModel.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'User update failed', error: error.message });
  }
});



userRouter.delete('/:id', isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await usersModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});


module.exports= userRouter