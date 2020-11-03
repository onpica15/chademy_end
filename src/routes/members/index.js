// --------------------------- 以下引入模組 -------------------------------

const express = require('express')
const router = express.Router()


// const db = require(__dirname + '/../../db_connect2')

// const moment = require('moment-timezone')
// const multer = require('multer')
// const upload = require(__dirname + '/../../react-upload-img-module')

const controller = require('./controller')

//登入
router.post('/login', controller.login)

// 登出
// router.get('/logout', (req, res)=>{
//     delete req.session.admin;
//     // res.redirect('');
// })

// 註冊
router.post('/register', controller.register)


// 帳號驗證
router.get('/userAuth', controller.userAuth)

// 測試 用
router.post('/loginTest', controller.loginTest)
router.get('/getTest', controller.getTest)

module.exports = router
