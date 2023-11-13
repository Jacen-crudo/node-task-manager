const express = require('express')
const User = require('../models/user')
const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.status(201)
            .send({
                request: 'SUCCESS',
                message: 'User created!',
                data: user
            })
    } catch (e) {
        res.status(400)
            .send({
                request: 'ERROR',
                error: e
            })
    }
})

router.get('/users', async (req, res) => {
    try{
        const users = await User.find({})
        res.status(202)
            .send({
                request: 'SUCCESS',
                message: 'Retreived users',
                data: users
            })
    } catch(e) {
        res.status(500).send()
    }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    
    try {
        const user = await User.findById(_id)

        if(!user) return res.status(404).send()
        res.send({
            request: 'SUCCESS',
            message: 'User found!',
            data: user
        })
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOp = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOp) {
        return res.status(400)
            .send({
                request: 'ERROR',
                error: 'Invalid Updates!',
                message: 'Allowed Updates: ' + allowedUpdates
            })
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body , { new: true, runValidators: true })

        if (!user) res.status(404).send()

        res.send({
                request: 'SUCCESS',
                message: 'User updated',
                data: user
            })

    } catch (e) {
        res.status(400)
            .send({
                request: 'ERROR',
                error: e
            })
    }
})

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) return res.status(404).send()

        res.send({
            request: 'SUCCESS',
            message: 'User deleted!',
            data: user
        })

    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router