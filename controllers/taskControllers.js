const mongoose = require('mongoose')
const Task = require ('../models/Task')

//@desc Get all Tasks (Admin)
//@route GET /api/tasks
//@access Private (Admin)
const getTasks = async(req, res)=>{
    try{

        const {status} = req.query
        let filter = {}

        if(status){
            filter.status = status
        }

        let tasks;

        if(req.user.role === "admin"){
            tasks = await Task.find(filter).populate(
                "assignedTo",
                "name email profileImageUrl"
            )
        }else{
            tasks = await Task.find({...filter, assignedTo: req.user._id}).populate(
                "assignedTo",
                "name email profileImageUrl"
            )
        }

        //add completed todochecklist count to each task
        tasks = await Promise.all(
            tasks.map(async(task) =>{
                const completedCount = task.todoChecklist.filter(
                    (item) => item.completed).length
                return {...task._doc, completedCount:completedCount}

    })
        )

        //status summary counts
        const allTasks = await Task.countDocuments(req.user.role === "Admin" ? {} : {assignedTo:req.user._id})
        const pendingTasks = await Task.countDocuments({
            ...filter,
            status:"Pending",
            ...(req.user.role != "admin" && {assignedTo:req.user._id})
        })
        const inProgressTasks = await Task.countDocuments({
            ...filter,
            status:"In Progress",
            ...(req.user.role != "admin" && {assignedTo:req.user._id})
        })
        const completedTasks = await Task.countDocuments({
            ...filter,
            status:"Completed",
            ...(req.user.role != "admin" && {assignedTo:req.user._id})
        })
        res.json({
            tasks,
            statusSummary:{
                all:allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks
            }
        })
    }catch(error){
        res.status(500).json({message:"Server error", error})
    }
}

//@desc Get single Task
//@route GET /api/tasks/:id
//@access Private (Admin)
const getTaskById = async(req, res)=>{
    try{
        const task = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        )

        if(!task) return res.status(404).json({message:"Task not found"})
        
        res.json(task)

    }catch(error){
        res.status(500).json({message:"Server error", error})
    }
}

//@desc Create New Task
//@route POST /api/tasks
//@access Private (Admin)

const createTask = async(req, res)=>{
    try{
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist
        } = req.body

        //check if task is assigned
        if(!Array.isArray(assignedTo)){
            return res.status(400).json({message:"AssignedTo must be an array of user IDs"})
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist
        })
        res.status(201).json({message: `${title} task created!!`, task})
    }catch(error){
        res.status(500).json({message:"Server error", error})
    }
}


//@desc Update Task
//@route PUT /api/tasks/:id
//@access Private
const updateTask = async(req, res)=>{
    try{
        const task = await Task.findById(req.params.id)

        if(!task) return res.status(404).json({message:"Task not found"})

        task.title = req.body.title || task.title
        task.description = req.body.description || task.description
        task.priority = req.body.priority || task.priority
        task.dueDate = req.body.dueDate || task.dueDate
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist
        task.attachments = req.body.attachments || task.attachments

        if(req.body.assignedTo){
            if(!Array.isArray(req.body.assignedTo)){
                return res.status(400).json({message:"assigneTo must be an array of user IDs"})
            }
            task.assignedTo = req.body.assignedTo
        }
        const updatedTask = await task.save()
        res.json({message:"Task Updated Successfully", updatedTask})
    }catch(error){
        res.status(500).json({message:"Server error", error})
    }
}

//@desc Delete Task
//@route DELETE /api/tasks/:id
//@access Private (Admin)
const deleteTask = async(req, res)=>{
    try{
        const task = await Task.findById(req.params.id)

        if(!task) res.status(404).json({message:"Task not found"})
        
        await task.deleteOne()
        res.json(`${task.title} Deleted Successfully`)

    }catch(error){
        res.status(500).json({message:"Server error", error})
    }
}

//@desc Update Task status
//@route PUT /api/tasks/:id/status
//@access Private
const updateTaskStatus = async(req, res)=>{
    try{
        const task = await Task.findById(req.params.id)
        if(!task) res.status(404).json({message:"Task not found"})

        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        )

        if(!isAssigned && req.user.role !== 'admin'){
            return res.status(403).json({message:"Not Authorized"})
        }

        task.status = req.body.status || task.status

        if(task.status === 'completed'){
            task.todoChecklist.forEach((item) => (item.completed = true))
            task.progress = 100
        }

        await task.save()
        res.json({message:'Status Updated', task})

    }catch(error){
        res.status(500).json({message:"Server error", error})
    }
}


const updateTaskChecklist = async(req, res)=>{
    try{
        const {todoChecklist} = req.body
        const task = await Task.findById(req.params.id)

        if(!task) return res.status(400).json({message:"Task not found!!"})
        
        if(!task.assignedTo.includes(req.user._id) && req.user.role !== 'admin'){
            return res.staus(403).json({message:"Not authorized to update checklis"})
        }

        task.todoChecklist = todoChecklist //update checklist

        //auto update progress
        const completedCount = task.todoChecklist.filter(
            (item) => item.completed
        ).length
        const totalItems = task.todoChecklist.length
        task.progress = totalItems > 0 ? Math.round((completedCount/totalItems) * 100) : 0

        //auto mark task as complete if all items are checked
        if (task.progress == 100){
            task.status = "Completed"
        } else if(task.progress > 0){
            task.status == "In Progress"
        }else{
            task.status = "Pending"
        }

        await task.save()
        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        )

        res.json({message:"Task checklist Updated", task:updatedTask})

    }catch(error){
        res.status(500).json({message:"Server error", error})
    }
}


const getDashboardData = async(req, res)=>{
    try{
    
        //fetch stats
        const totalTask = await Task.countDocuments()
        const pendingTask = await Task.countDocuments({status: "Pending"})
        const completedTask = await Task.countDocuments({status:"Completed"})

        const overdueTask = await Task.countDocuments({
            status:{$ne: "Completed"},
            dueDate:{$lt: new Date()}
        })

        //Ensure all  possible statuses are included
        // const taskStatuses = ["Pending", "In Progress", "Completed"]
        // const taskDistributionRow = await Task.aggregate([
        //     {
        //         $group:{
        //             _id:"status",
        //             count:{$sum:1}
        //         },
        //     },
        // ])

        // const taskDistribution = taskStatuses.reduce((acc, status) =>(
        //     const formattedKey = status.replace(" ")
        // ))

    }catch(error){
        res.status(500).json({message:"Server error", error})
    }
}


const getUserDashboardData = async(req, res) =>{
    try{

    }catch(error){
        res.status(500).json({message:"Server error", error})
    }
}

module.exports ={
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData
}