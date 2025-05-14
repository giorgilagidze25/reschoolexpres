const { Router } = require("express");
const userSchema = require("../validetion/users.validetion");
const usersModel = require("../models/users.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const isAuth = require("../midelwear/isAuth.midelwear");
require('dotenv').config();

const authRouter = Router();

authRouter.post('/sign-up', async (req, res) => {
    const { error } = userSchema.validate(req.body || {});
    if (error) return res.status(400).json(error);

    const { fullName, email, password } = req.body;

    const existUser = await usersModel.findOne({ email });
    if (existUser) return res.status(400).json({ message: 'user already exists' });

    const hashedPass = await bcrypt.hash(password, 10);

    const role = email === "admin12@gmail.com" && password === "admin12" ? "admin" : "user";

    await usersModel.create({ fullName, email, password: hashedPass, role });

    res.status(201).json({ message: "user registered successfully" });
});

authRouter.post('/sign-in', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

        const existUser = await usersModel.findOne({ email }).select('password _id role');
        if (!existUser) return res.status(400).json({ message: 'email or password is invalid' });

        const isPassEqual = await bcrypt.compare(password, existUser.password);
        if (!isPassEqual) return res.status(400).json({ message: 'email or password is invalid' });

        const payload = { userId: existUser._id, role: existUser.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json(token);
    } catch (err) {
        console.error('Sign-in error:', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

authRouter.get('/current-user', isAuth, async (req, res) => {
    const user = await usersModel.findById(req.userId).select('-password');
    res.json(user);
});

module.exports = authRouter;
