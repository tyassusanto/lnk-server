const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()

const app = express()

const authRoutes = require('./src/Routes/auth.route')

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