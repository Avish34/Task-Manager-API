const app=require('./app')
const port= process.env.PORT

app.listen(port,()=>{
    console.log('Server Stared Successfully')
    console.log(process.env.PORT)
})
