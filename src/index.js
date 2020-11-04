// -----------------------以下開始引入套件、模組設定------------------------
const express = require('express') //express
const db = require(__dirname + '/db_connect2') // 引用模組，模組裡安裝mysql2
const moment = require('moment-timezone')
const upload = require(__dirname + '/upload-img-module')
const multer = require('multer')
const cors = require('cors')

const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

// -------------------以下開始物件、top use middleware設定------------------------

// 建立app物件
const app = express()

// 解析 request Cookies
app.use(cookieParser())

// 解析urlencoded格式middleware
app.use(
  express.urlencoded({
    extended: false,
  })
)

// 解析json格式middleware
app.use(express.json())

// cors
const corsOptions = {
  origin: ['http://localhost:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
// app.use(cors())
// const corsOptions = {
//   credentials: true,
//   origin: function (origin, cb) {
//     console.log(`origin: ${origin}`);
//     cb(null, true);
//   },
// };
// app.use(cors(corsOptions));

// 使用樣版引擎
app.set('view engine', 'ejs')

// 路由驗證
app.use((req, res, next) => {
  // 跟下面一樣 => const token = req.cookies['chademy-token']
  const { ['chademy-token']: token } = req.cookies

  // 白名單
  const whiteList = [
    'list',
    'login',
    'logout',
    'register',
    'userAuth',
    'forgetPwd',
    'resetPWD',
    'man_product',
    'man_secondhand',
    'man_fund',
    'a_experience_mainlist',
    'j_cart',
  ]

  // 如果請求的網址 "包含" 白名單，就給過。

  const beforeQqeryUrl = req.url.split('?')[0]

  // =>  [ '', 'members', 'login' ]
  const oneLevelUrl = beforeQqeryUrl.split('/')

  console.log(oneLevelUrl)

  if (
    whiteList.includes(oneLevelUrl[1]) ||
    whiteList.includes(oneLevelUrl[2])
  ) {
    console.log('  => Pass ')
    next()
  } else {
    let authToken = req.get('Authorization')

    console.log('  => authToken ')
    console.log(authToken)

    // 沒有 authToken
    if (!authToken) return res.type('text/plain').status(404).send('查無此頁')

    authToken = authToken.slice(7)

    jwt.verify(authToken, process.env.TOKEN_SECRET, (error, payload) => {
      if (!error) {
        console.log(' ! error ')
        next()
      } else {
        // 如果沒有 token 以及不在白名單內
        return res.json({
          code: 999,
          success: false,
          msg: '時間過長，請重新登入',
          data: null,
        })
      }
    })

    // next()

    console.log('\n', 3)
  }
})

// -------------------------------以下開始路由設定------------------------

// 首頁路由
app.get('/', (req, res) => {
  res.send('首頁')
})

// 引入產品路由

app.use('/man_product', require(__dirname + '/routes/man_product'))

// 引入二手路由

app.use('/man_secondhand', require(__dirname + '/routes/man_secondhand'))

// 引入募資路由

app.use('/man_fund', require(__dirname + '/routes/man_fund'))

// 引入競標路由

// 引入課程路由
app.use(
  '/a_experience_mainlist',
  require(__dirname + '/routes/a_experience_mainlist')
)

app.use('/a_wood_maker', require(__dirname + '/routes/a_wood_maker'))

app.use('/a_title_mainlist', require(__dirname + '/routes/a_title_mainlist'))

// 引入品牌故事路由

// 引入部落格路由

// 引入會員路由
app.use('/members', require(__dirname + '/routes/members'))

// 引入購物車路由
app.use('/j_cart', require(__dirname + '/routes/j_cart'))

// public 資料夾middleware
app.use(express.static(__dirname + '/../public'))

// 404 middleware
app.use((req, res) => {
  res.type('text/plain').status(404).send('查無此頁')
})

// -------------------------------以下開始伺服器監聽------------------------

app.listen(3001, () => {
  console.log('伺服器已啟動')
})
