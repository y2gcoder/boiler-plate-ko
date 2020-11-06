const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;                  //salt가 몇글자인지 나타냄.
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})
//user model에 유저 정보를 저장하기 전에 무엇을 해줄지. 
//next : 이 function으로 register 라우터로 보내버리는 것. 
userSchema.pre('save', function (next) {
    const user = this;
    if (user.isModified('password')) {
        //비밀번호를 암호화 시킨다. 
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)                                       //에러가 나면 index의 user.save로 보내줌.
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                // Store hash in your password DB
                user.password = hash
                next()
            });
        });
    } else {
        next(); //next가 있어야 머물지 않고 다음 모듈로 이동할 수 있음.
    }
    
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
    //1. plainPassword 1234567      암호화된 비밀번호 
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if (err) return cb(err)
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {
    const user = this;
    //jsonwebtoken을 이용해서 token을 생성하기.
    //user._id가 plainObject가 아니면 에러가 발생함.
    const token = jwt.sign(user._id.toHexString(), 'secretToken');
    user.token = token
    user.save(function (err, user) {
        if (err) return cb(err)
        cb(null, user)
    })
}

const User = mongoose.model('User', userSchema) //모델로 감싸주기.
module.exports = {User}                         //다른 곳에서 쓸 수 있게. 