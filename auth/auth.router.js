const { Router } = require("express");
const userSchema = require("../validetion/users.validetion");
const usersModel = require("../models/users.model");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const isAuth = require("../midelwear/isAuth.midelwear");


require('dotenv').config()

const authRouter = Router()

authRouter.post('/sing-up', async (req, res)=>{

     const {error} = userSchema.validate(req.body || {})
     if(error){
        return res.status(400).json(error)
     } 
    const {fullName, email, password} = req.body

    const existUser=await usersModel.findOne({email})
    
    if(existUser){
        return res.status(400).json({message: 'users alredy exists'})
    }
     

    const hashedPass = await bcrypt.hash(password, 10)
    await usersModel.create({fullName, password:hashedPass, email})

    res.status(201).json({message:'user registerd succsesfully'})



})




authRouter.post('/sing-in', async (req, res) => {
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({message: 'email and password is required'})
    }

   const existUser = await usersModel.findOne({email})

   if(!existUser){
    return res.status(400).json({message: ' email or password is invalid'})
   }

   const isPassEqual = await bcrypt.compare(password, existUser.password)
   if(!isPassEqual){
    return res.status(400).json({message: ' email or password is invalid'})
   }

   const payload = {
    userId: existUser._id
   }
   
   const token = await jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'})
   
   res.json(token)
})


authRouter.get('current-user', isAuth, async (req, res)=>{
    const user = await usersModel.findById(req.userId)
    res.json(user)
})

module.exports = authRouter