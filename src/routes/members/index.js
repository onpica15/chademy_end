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
router.post('/logout', (req, res) => {
  delete req.session.sid

  return res.json({
    success: true,
    msg: '登出成功',
    data: null,
  })
})

// 註冊
router.post('/register', controller.register)

//忘記密碼
router.post('/forgetPwd', controller.forgetPwd)

// 重置密碼
router.post('/resetPWD', controller.resetPWD)

// 會員中心
router.post('/getUserInfo', controller.getUserInfo)

router.post('/setUserInfo', controller.setUserInfo)
router.post('/getUserCouponInfo', controller.getUserCouponInfo)

// 信用卡
router.post('/getUserCreditcardInfo', controller.getUserCreditcardInfo)
router.post('/setUserCreditcardInfo', controller.setUserCreditcardInfo)

router.post('/getUserEmail', controller.getUserEmail)
router.post('/setUserEmail', controller.setUserEmail)

router.post('/getCommentt', controller.getCommentt)

// 帳號驗證
router.get('/userAuth', controller.userAuth)

// ---------- 測試/example ----------
router.post('/loginTest', controller.loginTest)
router.get('/getTest', controller.getTest)
router.post('/example', controller.example)

module.exports = router
