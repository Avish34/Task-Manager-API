const mongoose=require('mongoose')
const connectionURL=process.env.MONGO_URL
const validator=require('validator')
mongoose.connect(connectionURL,{ useNewUrlParser: true,useCreateIndex:true})


