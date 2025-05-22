const { Router } = require("express");
const usersModel = require("../models/users.model");
const uploads = require("../config/claudinary.config");

const userRouter = Router()

userRouter.get('/', async (req, res) => {
   const users = await usersModel.find().sort({_id: -1})
   res.status(200).json(users)
})
userRouter.put('/', uploads.single('avatar'), async (req, res) => {
  const id = req.userId
  const {email} = req.body
  const fillPath= req.file.path

  await usersModel.findByIdAndUpdate(id, {email, avatar: fillPath}) 
  res.status(200).json({message: 'user updated succsesfully'})
})
module.exports= userRouter