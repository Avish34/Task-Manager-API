const express=require('express')
const router=express.Router()
const User=require('../models/user')
const auth=require('../middleware/auth')
const sharp=require('sharp')
const multer=require('multer')
const mail=require('../emails/account')
const client=require('twilio')(process.env.asid,process.env.acctoken)
router.post('/users',async (req,res)=>{
    const user=new User(req.body)
    try{
        await user.save()
        mail.Welcomemail(user.email,user.name)
        const token=  await user.genrateAuthToken()
       
        // console.log(token)
        
          res.status(201).send({user,token})
          
        //res.status(201).send(user)
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/login',async (req,res)=>{
    try{
        const user= await User.findByCredentials(req.body.email,req.body.password)
       const token=  await user.genrateAuthToken()
      // console.log(token)
      
        res.send({user,token})
    }
    catch(e){
            res.status(404).send()
    }
})

router.post('/users/logout',auth,async (req,res)=>{
    try{
    req.user.tokens=req.user.tokens.filter((token)=>{
         return token.token!=req.token
    })
    await req.user.save()
    res.status(200).send()
}
catch(e){
    res.status(500).send()
}
})

router.post('/users/logoutAll',auth,async (req,res)=>{
    try{
    req.user.tokens=[]
      
    await req.user.save()
    res.status(200).send()
}
catch(e){
    res.status(500).send()
}
})

router.get('/users/me',auth,async (req,res)=>{
   try{
    res.send(req.user)
   }
   catch(e)
   {
    res.status(500).send(e)
   }
   
})



router.patch('/users/me',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
       
       updates.forEach((update)=>{
           req.user[update]=req.body[update]
       })
       await req.user.save()
        if (!req.user) {
            return res.status(404).send()
        }

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me',auth,async (req,res)=>{
    
    try{
        req.user.remove()
        mail.CancelMail(req.user.email, req.user.name)
        res.send(req.user)    
    }
    catch(e)
    {
        res.status(500).send()
    }
   
}) 
const upload=multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {   
            
            return cb(new Error('Please Upload an Image'))
            
        }
        cb(undefined,true)
    }

})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    //console.log(error.message)
    res.status(400).send({error : error.message })
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    //console.log(error.message)
    res.status(400).send({error : error.message })
})

router.get('/users/:id/avatar',async (req,res)=>{
    const user=await User.findById(req.params.id)
    try{
        if(!user || !user.avatar)
        {
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }
    catch(e){
        res.status(404).send()
    }
})

router.post('/login/pno',async (req,res)=>{
    
    const no='+91' + req.body.pno
    console.log(no)
    try{
        const user=await User.findOne({pno:req.body.pno})
        if(!user)
            throw new Error();
        
        
       else{ 
        client.verify.services(process.env.serid)
        .verifications
        .create({to: no, channel:'sms'})
        .then((message) =>res.status(201).send(message));  
       }
              
    }
    catch(e)
    {
        res.status(401).send(e);
    }
})


router.post('/verify',async (req,res)=>{
    console.log(req.body.pno)
    console.log(req.body.code) 
    const no='+91' + req.body.pno
    client.verify.services(process.env.serid)
    .verificationChecks
    .create({to: no, code: req.body.code})
    .then(async (verification_check) =>{
                if(verification_check.status)
                {
                    const user= await User.findOne({pno:req.body.pno})
                    const token=await user.genrateAuthToken();
                    res.status(201).send(token)
                }
    } );
      
    
      
})

module.exports=router