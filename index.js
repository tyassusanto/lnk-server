const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./src/Helpers/connection')

const app = express()
app.use(morgan('dev'))
app.use(express.json())

const authRoutes = require('./src/Routes/authRoute')

app.use('/auth', authRoutes)

app.use((req, res, next) => {
    next(createError.NotFound())
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`server is running on port : ${PORT}`);
})