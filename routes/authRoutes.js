const express = require('express')
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authControllers')
const { protect } = require('../middlewares/authMiddlewares')
const upload = require('../middlewares/uploadMiddleware')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', protect, getUserProfile)
router.put('/profile', protect, updateUserProfile)

router.post("/upload-image", upload.single("image"), (req, res) =>{
    if(!req.file){
        return res.status(400).json({message:"Pick a file"})
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.file}`
    res.status(200).json({imageUrl})
})

module.exports = router
