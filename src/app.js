const express=require('express')
const app=express()
require('./db/mongoose')
const Task=require('./models/task')
const User=require('./models/user')
const port= process.env.PORT
const UserRouter=require('./routers/user.js')
const TaskRouter=require('./routers/task.js')
app.use(express.json())

app.use(UserRouter)
app.use(TaskRouter)

module.exports=app
