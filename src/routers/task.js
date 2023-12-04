const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201)
            .send({
                status: 'SUCCESS',
                message: 'Task created!',
                data: task
            })
    } catch (e) {
        res.status(400)
            .send({
                status: 'ERROR',
                error: e
            })
    }
})

router.get('/tasks', auth, async (req, res) => {

    try {
        await req.user.populate('tasks').execPopulate()

        res.status(202)
            .send({
                status: 'SUCCESS',
                message: 'Retreived tasks',
                data: req.user.tasks
            })
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if(!task) return res.status(404).send()

        res.send({
                status: 'SUCCESS',
                message: 'Task found!',
                data: task
            })
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
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
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) return res.status(404).send()

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send({
            status: 'SUCCESS',
            message: 'Task updated',
            data: task
        })
        
    } catch (e) {
        res.status(400)
            .send({
                status: 'ERROR',
                error: e
            })
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) return res.status(404).send()

        res.send({
            status: 'SUCCESS',
            message: 'Task deleted!',
            data: task
        })

    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router