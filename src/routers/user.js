const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account')
const router = new express.Router()

// POST ROUTES
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        sendWelcomeEmail(user.email, user.name)
        res.status(201)
            .send({
                status: 'SUCCESS',
                message: 'User created!',
                data: { user, token }
            })
    } catch (e) {
        res.status(400)
            .send({
                status: 'ERROR',
                error: e
            })
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({
            status: 'SUCCESS',
            data: { user, token }
        })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => { return token.token !== req.token })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// '/useers/me/avatar' multer requirements
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) return cb(new Error('Unsupported file type! Supported File Types: .jpg, .jpeg, .png'))
        
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400)
        .send({
            status: 'ERROR',
            error: error.message
        })
})

// GET ROUTES
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

// PATCH ROUTES
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOp = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOp) {
        return res.status(400)
            .send({
                status: 'ERROR',
                error: 'Invalid Updates!',
                message: 'Allowed Updates: ' + allowedUpdates
            })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send({
                status: 'SUCCESS',
                message: 'User updated',
                data: req.user
            })

    } catch (e) {
        res.status(400)
            .send({
                status: 'ERROR',
                error: e
            })
    }
})

// DELETE ROUTES
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send({
            status: 'SUCCESS',
            message: 'User deleted!',
            data: req.user
        })

    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send({
            status: 'SUCCESS',
            message: 'Avatar deleted!'
        })
    } catch(e) {
        res.status(500).send()
    }
})

module.exports = router