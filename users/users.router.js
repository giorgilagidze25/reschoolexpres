const { Router } = require("express");
const usersModel = require("../models/users.model");


const userRouter = Router()



userRouter.get('/', async (req, res) => {
   const users = await usersModel.find().sort({_id: -1})
   res.status(200).json(users)
})


module.exports= userRouter