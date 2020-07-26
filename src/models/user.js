const validator=require('validator')
const bcrypt=require('bcrypt')
const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const Task=require('./task')


const userschema=new mongoose.Schema({
    name : {
        type : String,
    },
    email:{
        type: String,
        unique: true,
        lowercase: true,
        trim : true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error('Please check your email')

        }   
    },
    password: {
        type : String,
        required: true,
        tirm: true,
        minlength: 5,
        validate(value){
            if(value.toLowerCase().includes('password') )
                throw new Error('Password should of length and 6,and should not be equal to password')
        }
    },

    pno:{
        type: String,
        validate(value)
        {
            if(value.length>10 || value.length<10)
                throw new Error('Phone Number not valid')
        }
    },

    age :{
        type: Number,
        defualt: 0,
        validate(value){
            if(value<0)
                throw new Error('Age Should be Positive')
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type : Buffer
    }
},{
    timestamps: true
})
userschema.virtual('tasks',{
    ref: 'Task',
    localField : '_id',
    foreignField : 'owner'
})
userschema.methods.toJSON= function(){
    const user=this
    const userObject=user.toObject()
    delete userObject.password
    delete userObject.avatar
    delete userObject.tokens
    return userObject

}

userschema.methods.genrateAuthToken= async function(){
    try{
    const user=this
    const token=  jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET)
    user.tokens=user.tokens.concat({token :token})
       // console.log(user)
       
        await user.save()
        return token
       }
        
    catch(e){
        throw new Error()
    }
}

userschema.statics.findByCredentials= async (em,password)=>{
    const user= await User.findOne({email: em})
    if(!user)
    {
        throw new Error('Unable to login')
    }
    const isMatch= await bcrypt.compare(password,user.password)
    if(!isMatch)
    {
        throw new Error('Unable to login')
    }
    return user

}



userschema.pre('save',async function(next){
    const user=this
    if(user.isModified('password'))
    {
        user.password=await bcrypt.hash(user.password,8);
    }
    next()

})
userschema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({owner: user._id})
    next()
})

const User= mongoose.model('User',userschema)
module.exports=User
