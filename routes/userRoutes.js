const express = require('express')
const { adminOnly, protect } = require('../middlewares/authMiddlewares')
const { getUsers, getUserById} = require('../controllers/userControllers')

const router = express.Router()

//user management routes
router.get('/', protect, adminOnly, getUsers)//get users admin only
router.get('/:id', protect, getUserById)//get specific user

module.exports = router