const express = require('express')
const  router = express.Router()

router.post('/register', (req, res, next) => {
    res.send('Register Router')
})

router.post('/login', (req, res, next) => {
    res.send('Login Router')
})

router.post('/refresh-token', (req, res, next) => {
    res.send('Refresh Token Router')
})

router.delete('/Logout', (req, res, next) => {
    res.send('Logout Router')
})

module.exports = router