const express = require('express')
const Task = require('../models/task')
const router = new express.Router()

router.post('/tasks', async (req, res) => {
    const task = new Task(req.body)

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

router.get('/tasks', async (req, res) => {

    try {
        const tasks = await Task.find({})
        res.status(202)
            .send({
                status: 'SUCCESS',
                message: 'Retreived tasks',
                data: tasks
            })
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findById(_id)

        if(!task) return res.status(404).send()

        res.send({
                status: 'SUCCESS',
                message: 'User found!',
                data: task
            })
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', async (req, res) => {
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
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        if (!task) res.status(404).send()

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

router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)

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