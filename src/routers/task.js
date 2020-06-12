const express=require('express')
const router=express.Router()
const Task=require('../models/task')
const auth=require('../middleware/auth')

router.get('/task',auth,async (req,res)=>{
    const match={}
    const sort={}
    if(req.query.completed)
    {
        match.completed= req.query.completed === 'true'
    }    
    if(req.query.sortBy)
    {
        const parts=req.query.sortBy.split(':')
        sort[parts[0]]= parts[1]==='desc'? -1 : 1
    }
    try{
        await req.user.populate({
            path:'tasks',
       match,
    options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
    } }).execPopulate()
        //console.log(req.user)
        res.send(req.user.tasks)
    }
    catch(e){
        res.status(500).send()
    }
    
})

router.get('/task/:id',auth,async (req,res)=>{
    const _id=req.params.id
    //console.log(__id)
    try{
        const task=await Task.findById({_id,owner:req.user._id})
        if(!task)
            return res.status(404).send
        res.send(task)  
    }
    catch(e){
        res.status(500).send()
    }
})

router.post('/task',auth,async (req,res)=>{
    const task=new Task({
        ...req.body,
        owner:  req.user._id
    })
    
   
   //const task=new Task(req.body)
    try{
        await task.save()
        res.send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})


router.patch('/task/:id',auth,async (req,res)=>{
    const Valid=['description','completed']
    const updates=Object.keys(req.body)
    const ischeck=updates.every((update)=>Valid.includes(update))
    if(!Valid)
    {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try{
        const task=await Task.findOne({_id:req.params.id,owner: req.user.id})
        await task.save()
    
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update)=>{
            task[update]=req.body[update]
        })

        res.send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.delete('/task/:id',async (req,res)=>{
    const __id=req.params.id
    try{
        const task=await Task.findOneAndDelete({_id:req.params.id,owner: req.user.id})
        if(!task)
            return res.status(404).send
        res.send(task)    
    }
    catch(e)
    {
        res.status(500).send()
    }
   
}) 

module.exports=router