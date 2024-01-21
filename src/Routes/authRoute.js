const express = require('express')
const  router = express.Router()
const userControllers = require('../Controllers/userController')

router.post('/register', userControllers.register)

router.post('/login', userControllers.login)

router.post('/refresh-token', userControllers.refreshToken)

router.delete('/Logout', (req, res, next) => {
    res.send('Logout Router')
})

module.exports = router