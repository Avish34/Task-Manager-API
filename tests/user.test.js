const app=require('../src/app')
const request=require('supertest')
const User=require('../src/models/user')
const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const uid=new mongoose.Types.ObjectId
const userone={
   _id: uid,
    name: 'avi',
    email: 'az@gmail.com',
    password: 'avishhh',
    tokens: [{
        token: jwt.sign({_id:uid},process.env.JWT_SECRET)
    }]
}
beforeEach(async ()=>{
    await User.deleteMany()
    await new User(userone).save()
})
test('User Sign Up',async ()=>{
    await request(app).post('/users').send({
        name:'Avish',
        email: 'abc@q.com',
        password: "abc1234"
    }).expect(201)
})

test('User Login',async ()=>{
    await request(app).post('/users/login').send({
        email: userone.email,
        password: userone.password
    }).expect(200)
})
test('User Login denied',async ()=>{
    await request(app).post('/users/login').send({
        email: userone.email,
        password: 'yespass'
    }).expect(404)
})

test('Authenticate', async ()=>{
    await request(app).get('/users/me').set('Authorization',`Bearer ${userone.tokens[0].token}`).send().expect(200) 
})

test('Should not Authenticate', async ()=>{
    await request(app).get('/users/me').send().expect(404) 
})
test('delete', async ()=>{
    await request(app).delete('/users/me').set('Authorization',`Bearer ${userone.tokens[0].token}`).send().expect(200) 
})

test('not able to delete', async ()=>{
    await request(app).delete('/users/me').send().expect(404) 
})

