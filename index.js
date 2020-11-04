const express = require('express');
const app = express();
const port = 5000
const bodyParser = require('body-parser')

const config = require('./config/key')

const { User } = require("./models/User")

//body-parser 가 클라이언트에서 오는 정보를 서버에서 처리할 수 있게 해주는 것. 
//application/x-www-form-urlencoded 정보 가져오기.
app.use(bodyParser.urlencoded({extended: true}))
//application/json 타입을 분석해서 가져오기.
app.use(bodyParser.json())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/register', (req, res) => {
    //회원 가입할 때 필요한 정보들을 client에서 가져오면
    //그것들을 데이터베이스에 넣어준다.
    //req.body는 body-parser가 있어서 가능함. 
    const user = new User(req.body) //req.body 안에는 json 형식
    user.save((err, userInfo) => {
        if (err) return res.json({ success: false, err})
        return res.status(200).json({
            success: true
        })
    })



})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))