const express = require('express')
const userRouter = require('./users/users.router')
const connectToDb = require('./db/db')
const authRouter = require('./auth/auth.router')
const isAuth = require('./midelwear/isAuth.midelwear')
const postRouter = require('./posts/posts.router')
const cors = require('cors')
const uploads = require('./config/claudinary.config')

connectToDb()

const app = express()

app.use(cors())

app.use(express.json())
app.use(express.static('uploads'))

app.use('/users', isAuth, userRouter)
app.use('/posts', isAuth, postRouter)
app.use('/auth', authRouter)

app.post('/upload', uploads.single('image'), (req,res) => {
    res.send(req.file)
})

app.get('/', (req, res) => {
    res.send('hello word')
})


app.listen(3000, () =>{
    console.log('server runing on http://localhost:3000')
})
