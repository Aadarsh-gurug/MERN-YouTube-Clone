import express from "express";
import cors from 'cors'
import dotenv from "dotenv"
import morgan from 'morgan'
import Connection from "./config/db.js";
import userRoutes from './routes/userRoutes.js'
import videoRoutes from './routes/videoRoutes.js'
import path from 'path'
dotenv.config()
const app = express()
const port = process.env.PORT || 3000;
app.use(cors())
app.use(morgan('dev'))
app.use(express.json({ extended: true }))
app.use(express.urlencoded({ extended: true }))
app.use('/api/v1/auth', userRoutes)
app.use('/api/v1/videos', videoRoutes)
app.use(express.static('client/build'))
Connection()

app.get('/*', (req, res) => {
    res.sendFile(path.resolve('./client/build/index.html'))
})

app.listen(port, () => { console.log(`server is running on port ${port}`); })