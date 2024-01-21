const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const client = require('./redis')


const signAccessToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {
        }
        const secret = "zxcxz@123"
        const options = {
            expiresIn: "30s",
            audience: [userId]
        }
        jwt.sign(payload, secret, options, (err, token) => {
            if (err) {
                console.log(err)
                reject(createError.InternalServerError())
            }
            resolve(token)
        })
    })
}

const verifyAccessToken = (req, res, next) => {
    if (!req.headers['authorization']) return next(createError.Unauthorized())
    const authHeader = req.headers['authorization']
    const bearerToken = authHeader.split(' ')
    const token = bearerToken[1]
    jwt.verify(token, 'zxcxz@123', (err, payload) => {
        if (err) {
            const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
            return next(createError.Unauthorized(message))
        }
        req.payload = payload
        next()
    })
}

const signRefreshToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {
        }
        const secret = "zxcxz@qwe"
        const options = {
            expiresIn: "1y",
            audience: [userId]
        }
        jwt.sign(payload, secret, options, (err, token) => {
            if (err) {
                console.log(err)
                reject(createError.InternalServerError())
            }

            client.SET(userId, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                    return
                }
                resolve(token)
            })
        })
    })
}

const verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jwt.sign(refreshToken, 'zxcxz@qwe', (err, payload) => {
            if (err) return reject(createError.Unauthorized())
            const userId = payload.audience //aud
            client.GET(userId, (err, result) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                    return
                }
                if (refreshToken === result) return resolve(userId)
                reject(createError.Unauthorized())
            })

            resolve(userId)
        })
    })
}


module.exports = {
    signAccessToken,
    verifyAccessToken,
    signRefreshToken,
    verifyRefreshToken
}