const { Router } = require("express");
const userSchema = require("../validetion/users.validetion");
const usersModel = require("../models/users.model");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const isAuth = require("../midelwear/isAuth.midelwear");
const multer = require('multer');

require('dotenv').config()

const authRouter = Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });


authRouter.post('/sign-up', async (req, res) => {
    const {error} = userSchema.validate(req.body || {})
    if(error){
        return res.status(400).json(error)
    }
    const {fullName, email, password} = req.body

    const existUser = await usersModel.findOne({email})
    if(existUser){
        return res.status(400).json({message: 'user already exist'})
    }

    const hashedPass = await bcrypt.hash(password, 10)
    await usersModel.create({fullName, password: hashedPass, email})
    res.status(201).json({message: "user regisgted successfully"})

})
authRouter.post('/sign-in', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password is required' })
    }

    const existUser = await usersModel.findOne({ email }).select('password _id')
    if (!existUser) {
      return res.status(400).json({ message: 'email or password is invalid' })
    }

    const isPassEqual = await bcrypt.compare(password, existUser.password)
    if (!isPassEqual) {
      return res.status(400).json({ message: 'email or password is invalid' })
    }

    const payload = { userId: existUser._id }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })

    res.json(token)
  } catch (err) {
    console.error('Sign-in error:', err)
    res.status(500).json({ message: 'Something went wrong' })
  }
})


authRouter.get('/current-user', isAuth, async (req, res) => {
    const user = await usersModel.findById(req.userId)
    res.json(user)
})

module.exports = authRouter