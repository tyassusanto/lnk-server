const express = require('express')
const createError = require('http-errors')
const User = require('../Models/userModels')
const authSchema = require('../Helpers/validationSchema')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../Helpers/jwtHelper')
const client = require('../Helpers/redis')


const register = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const validateSchema = await authSchema.validateAsync(req.body)

        const userExist = await User.findOne({ email })
        if (userExist)
            throw createError.Conflict(`${email} already registered`)

        const user = new User(validateSchema)
        const savedUser = await user.save()
        const accessToken = await signAccessToken(savedUser._id)
        const refreshToken = await signRefreshToken(savedUser._id)

        res.status(200).json({ accessToken, refreshToken })
        // res.send(savedUser)

    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const validateSchema = await authSchema.validateAsync(req.body)
        const user = await User.findOne({ email: validateSchema.email })
        if (!user)
            throw createError.NotFound('User Not Found')

        const isMatch = await user.isValidPassword(validateSchema.password)
        if (!isMatch)
            throw createError.NotFound('Invalid Email or Password')

        const accessToken = await signAccessToken(user._id)
        const refreshToken = await signRefreshToken(user._id)


        res.status(200).json({ accessToken, refreshToken })
    } catch (error) {
        next(error)
    }
}

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) throw createError.BadRequest()
        const userId = await verifyRefreshToken(refreshToken)

        const accessToken = await signAccessToken(userId)
        const newRefreshToken = await signRefreshToken(userId)

        res.status(200).json({ accessToken, newRefreshToken })
    } catch (error) {
        next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) throw createError.BadRequest()
        const userId = await verifyRefreshToken(refreshToken)
        client.DEL(userId, (err, val) => {
            if(err) {
                console.log(err.message)
                throw createError.InternalServerError()
            }
            console.log(val)
            res.status(204)
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    register,
    login,
    refreshToken,
    logout
}