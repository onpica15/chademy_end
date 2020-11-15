"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// -----------------------以下開始引入套件、模組設定------------------------
var express = require('express'); //express


var db = require(__dirname + '/db_connect2'); // 引用模組，模組裡安裝mysql2


var moment = require('moment-timezone');

var upload = require(__dirname + '/upload-img-module');

var multer = require('multer');

var cors = require('cors');

var session = require('express-session');

var cookieParser = require('cookie-parser');

var jwt = require('jsonwebtoken'); // -------------------以下開始物件、top use middleware設定------------------------
// 建立app物件


var app = express(); // 解析 request Cookies

app.use(cookieParser('Chademy'));
app.use(session({
  name: 'token',
  secret: 'Chademy',
  // 建议使用 128 个字符的随机字符串
  cookie: {
    maxAge: 60 * 1000
  },
  saveUninitialized: true,
  resave: false
})); // 解析urlencoded格式middleware

app.use(express.urlencoded({
  extended: false
})); // 解析json格式middleware

app.use(express.json()); // cors

var corsOptions = {
  origin: ['http://localhost:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions)); // app.use(cors())
// const corsOptions = {
//   credentials: true,
//   origin: function (origin, cb) {
//     console.log(`origin: ${origin}`);
//     cb(null, true);
//   },
// };
// app.use(cors(corsOptions));
// 使用樣版引擎

app.set('view engine', 'ejs'); // 路由驗證

app.use(function (req, res, next) {
  // 白名單
  var whiteList = ['list', 'login', 'logout', 'register', 'userAuth', 'forgetPwd', 'resetPWD', 'man_product', 'product', 'productlist', 'man_secondhand', 'img', 'man_fund', 'checkfinish', 'a_experience_mainlist', 'a_title_mainlist', 'j_cart', 'product/api', 'example', 'getUserCouponInfo', 'getUserCreditcardInfo', 'getUserEmail'];
  var exclude = ['fundlistnode']; // 如果請求的網址 "包含" 白名單，就給過。

  var beforeQqeryUrl = req.url.split('?')[0]; // =>  [ '', 'members', 'login' ]

  var utlList = beforeQqeryUrl.split('/');
  console.log('  => api url path: ', utlList);

  if (whiteList.includes(utlList[1]) && !exclude.includes(utlList[2]) || whiteList.includes(utlList[2])) {
    console.log('    => whiteList Pass!!! ');
    next();
  } else {
    var authToken = req.get('Authorization');
    console.log('    => authToken: ', authToken); // 沒有 authToken

    if (!authToken) return res.type('text/plain').status(404).send('查無此頁');
    authToken = authToken.slice(7);
    jwt.verify(authToken, process.env.TOKEN_SECRET, function _callee(error, payload) {
      var QUERY_SQL, _ref, _ref2, _ref2$, _ref2$$, sid;

      return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (error) {
                _context.next = 15;
                break;
              }

              QUERY_SQL = "SELECT sid FROM members WHERE token = ?"; // 從表裡透過where拿到select

              _context.next = 4;
              return regeneratorRuntime.awrap(db.query(QUERY_SQL, [payload]));

            case 4:
              _ref = _context.sent;
              _ref2 = _slicedToArray(_ref, 1);
              _ref2$ = _slicedToArray(_ref2[0], 1);
              _ref2$$ = _ref2$[0];
              _ref2$$ = _ref2$$ === void 0 ? {} : _ref2$$;
              sid = _ref2$$.sid; //從資料庫拿出來 row(那筆資料)

              req.session.sid = sid;
              console.log('    => authToken: PASS!!!  sid => ', sid);
              next();
              _context.next = 17;
              break;

            case 15:
              console.log('    => authToken: Fail!!! '); // 如果沒有 token 以及不在白名單內

              return _context.abrupt("return", res.json({
                code: 999,
                success: false,
                msg: '時間過長，請重新登入',
                data: null
              }));

            case 17:
            case "end":
              return _context.stop();
          }
        }
      });
    });
  }
}); // -------------------------------以下開始路由設定------------------------
// 首頁路由

app.get('/', function (req, res) {
  res.send('首頁');
}); // 引入產品路由

app.use('/man_product', require(__dirname + '/routes/man_product')); // 引入二手路由

app.use('/man_secondhand', require(__dirname + '/routes/man_secondhand')); // 引入募資路由
// /man_fund  +  /children router

app.use('/man_fund', require(__dirname + '/routes/man_fund')); // 引入競標路由

app.use('/product/api', require(__dirname + '/routes/bid_product')); // 引入課程路由

app.use('/a_experience_mainlist', require(__dirname + '/routes/a_experience_mainlist'));
app.use('/a_wood_maker', require(__dirname + '/routes/a_wood_maker')); // 引入品牌故事路由
// 引入部落格路由

app.use('/a_title_mainlist', require(__dirname + '/routes/a_title_mainlist')); // 引入會員路由

app.use('/members', require(__dirname + '/routes/members')); // 引入購物車路由

app.use('/j_cart', require(__dirname + '/routes/j_cart')); // public 資料夾middleware

app.use(express["static"](__dirname + '/../public')); // 404 middleware

app.use(function (req, res) {
  res.type('text/plain').status(404).send('查無此頁');
}); // -------------------------------以下開始伺服器監聽------------------------

app.listen(3001, function () {
  console.clear();
  console.log('\n ============== 伺服器已啟動 ============== \n');
});