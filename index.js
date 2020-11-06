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

app.post('/login', (req, res) => {
    //1. 요청된 이메일을 데이터베이스 내에 있는 지 확인한다.
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {    //데이터베이스에 해당 email을 가진 user가 없다면
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            });
        }
        //2. 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) 
            return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})
            //3. 비밀번호까지 같다면 토큰을 생성하기.
            user.generateToken((err, user) => {
                
            })
        });
    })
    

    

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))