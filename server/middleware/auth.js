const { User } = require('../models/User');

let auth = (req, res, next) => {
    //인증 처리 하는 곳.
    //1. 클라이언트 쿠키에서 토큰을 가져온다.
    let token = req.cookies.x_auth;

    //2. 토큰을 복호화한 후 유저를 찾는다. 
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if(!user) return res.json({ isAuth: false, error: true })

        //req를 받을 때 토큰과 유저를 사용할 수 있게 하려고 미들웨어에서 req에 넣어줌.
        req.token = token;
        req.user = user;
        next()
    })

    //3. 유저가 있으면 인증 OK

    //4. 유저가 없으면 인증 No!

}

module.exports = { auth };