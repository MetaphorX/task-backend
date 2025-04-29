const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//Generate JWT Token
const generateToken = (userId)=>{
    return jwt.sign({id:userId}, process.env.JWT_SECRET, {expiresIn:"7d"})
}

//@desc Register new user
//@route POST /api/auth/register
//@access Public
const registerUser = async(req, res) =>{
    try{
        const {name, email, password, profileImageUrl, adminInviteToken} = req.body

        //check if user exists
        const userExists = await User.findOne({email})
        if(userExists){
            res.status(400).json({message: "User already exists"})
        }

        //determine user role:Admin if token is provided
        let role = "member"
        if (adminInviteToken && adminInviteToken == process.env.ADMIN_INVITE_TOKEN){
            role = "admin"
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //create new user
        const user = await User.create({
            name,
            email,
            password:hashedPassword,
            profileImageUrl,
            role
        })

        //return user with jwt
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            profileImageUrl:user.profileImageUrl,
            token:generateToken(user._id)

        })

    }catch(error){
        res.status(500).json({message: "Server Error", error})
    }
}


//@desc Login new user
//@route POST /api/auth/login
//@access Public
const loginUser = async(req, res) =>{
    try{
        const {email, password} = req.body
        const user = await User.findOne({email})

        //check for user
        if(!user){
            return res.status(401).json({message:"Email not found"})
        }

        //password check
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(401).json({message:"Wrong password"})
        }

        //return user data with jwt
        res.json({
            _id:user._id,
            name:user.name,
            email:user.name,
            role:user.role,
            profileImageUrl:user.profileImageUrl,
            token:generateToken(user._id)
        })

    }catch(error){
        res.status(500).json({message:'Server error', error})
    }
}

//@desc Get user Profile
//@route GET /api/auth/profile
//@access Private(requires jwt)
const getUserProfile = async(req, res) =>{
    try{
        const user = await User.findById(req.user.id).select("-password")
        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        res.json(user)

    }catch (error){
        res.status(500).json({message: 'Server error', error})
    }
}


//@desc Upate user
//@route PUT /api/auth/profile
//@access Private(requires jwt)
const updateUserProfile = async(req, res) =>{
    try{
        const user = await User.findById(req.user.id)
        if(!user){
            res.status(404).json({message:'User not found'})
        }

        user.name = req.body.name || user.name
        user.email = req.body.email || user.email

        if(req.body.password){
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(req.body.password, salt)
        }

        const updatedUser = await user.save()

        res.json({
            _id:updatedUser._id,
            name:updatedUser.name,
            email:updatedUser.email,
            role:updatedUser.role,
            token:generateToken(updatedUser._id)
        })

    }catch(error){
        res.status(500).json({message:"Server error", error})
    }
}


module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
}