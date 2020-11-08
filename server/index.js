const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key')
const { auth } = require('./middleware/auth')
const { User } = require("./models/User")

//body-parser 가 클라이언트에서 오는 정보를 서버에서 처리할 수 있게 해주는 것. 
//application/x-www-form-urlencoded 정보 가져오기.
app.use(bodyParser.urlencoded({extended: true}))
//application/json 타입을 분석해서 가져오기.
app.use(bodyParser.json())
//cookieparser 사용.
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/api/hello', (req, res) => {
    res.send('안녕하세요 ~')
})

app.post('/api/users/register', (req, res) => {
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

app.post('/api/users/login', (req, res) => {
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
                if (err) return res.status(400).send(err);

                // token을 저장한다. 어디에 ? 쿠키, 로컬스토리지, 세션 등등
                //cookie를 이용하려면 cookie-parser를 다운받아야 함.
                res.cookie("x_auth", user.token)
                .status(200)
                .json({loginSuccess: true, userId:user._id })
            })
        });
    })
})
//이 라우터 들은 나중에 Router(express에서 제공)로 분리를 해줄 것. 
app.get('/api/users/auth', auth, (req, res) => {    //auth ==> 미들웨어. 
    //여기까지 미들웨어를 통과해 왔다는 이야기는 Authentication이 true라는 말.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})
//로그인 된 상태이기 때문에 auth 미들웨어를 넣어줌. 
app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id}, { token: ""}, (err, user) => {
        if (err) return res.json({ success:false, err });
        return res.status(200).send({
            success: true
        })
    })
})

const port = 5000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))