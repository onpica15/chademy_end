const db = require(__dirname + '/../../db_connect2')

// 生成 JSON WEB TOKEN
const jwt = require('jsonwebtoken')

// 加密 解密
const { encry, decrypt } = require(__dirname + '/../../utils/crypto')
const emailService = require(__dirname + '/../../utils/mail')() //

console.log(emailService, emailService.send)

// SQL
const Login = require(__dirname + '/modules/login')
const Register = require(__dirname + '/modules/register')

// 導出模組
module.exports = {
  // 登入
  async login(req, res, next) {
    let Member = new Login(req.body.email, req.body.password) // 之後需要加密 encry
    const [response] = await db.query(Member.getSQL())

    if (response.length) {
      // const EXPIRES_IN = 24 * 60 * 60 * 1000 // 過期時間一天
      const EXPIRES_IN = 10 * 1000 // NOTE: 測試用 10 秒

      // 這邊還沒完全好
      const token = jwt.sign({ ...req.body }, process.env.TOKEN_SECRET, {
        expiresIn: EXPIRES_IN,
      })

      // 設定前端的 cookie，讓前端發送請求會帶這個 cookie
      res.cookie('chademy-token', token, { maxAge: EXPIRES_IN, httpOnly: true })

      // 除了 password 的其他資料，前端登入後不需要知道密碼
      const { password, ...otherData } = response[0]

      // 將其他資料在 data 中展開
      const data = { ...otherData }

      res.json({
        success: true,
        msg: '歡迎' + response[0].name + '的登入!',
        data: data,
      })
    } else {
      res.json({
        success: false,
        msg: '請輸入正確的帳號或密碼',
        data: null,
      })

      return
    }
  },

  // 註冊
  async register(req, res, next) {
    console.log(' register API ')
    // 取出 email, mobile，驗證是否註冊過
    const { email, mobile } = req.body

    // const token = encry(JSON.stringify(req.body))

    //

    // console.log(' 寄出認證信 ', encry(JSON.stringify(req.body)))

    // // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
    // // 因為透過 GET 要 encodeURIComponent 加密過的 TOKEN，接 token 才能拿到正確的值
    // const apiUrl = `http://${req.headers.host}/members/userAuth?token=`

    // // 先將會員資料用 JSON.stringify 轉成字串，然後 encry 加密，最後 encodeURIComponent
    // const token = `${encodeURIComponent(encry(JSON.stringify(req.body)))}`
    // const data = apiUrl + token

    // emailService.send({ to: email, data: data })
    // console.log('req.headers.host', req.headers.host)
    // console.log('url:', url)

    // emailService.send(email)

    //
    let Member = new Register({ email, mobile })

    const checkEmailMobile = async () => {
      const [emailRes] = await db.query(Member.queryEmail())
      const [mobileRes] = await db.query(Member.queryMobile())

      const noEmail = emailRes.length === 0 // 沒有信箱資料
      const noMobile = mobileRes.length === 0 // 沒有手機資料
      const noRegister = noEmail && noMobile // 兩者皆無，就是沒註冊

      return { noRegister, noEmail, noMobile }
    }

    //  新增
    const insertUser = async () => {
      // 拷貝前端的請求參數，建立時間，加密 password
      const data = {
        ...req.body,
        created_at: new Date(),
        password: encry(req.body.password),
      }

      console.log(
        'token:',

        encry(JSON.stringify(req.body)),
        '加密後: ',
        encry(req.body.password),
        '\n 解密後: ',
        decrypt(encry(req.body.password))
      )

      const result = await db.query('INSERT INTO `members` set ?', [data])

      // 把存入 db 的資料拿來生成 token
      const token = encry(JSON.stringify(data))

      const [{ insertId }] = result
      const UPDATE_TOKEN_SQL = 'UPDATE `members` SET token = ? WHERE sid = ?'
      await db.query(UPDATE_TOKEN_SQL, [token, insertId])

      return {
        result,
        token,
      }
    }

    // 取得註冊狀態
    const { noRegister, noEmail, noMobile } = await checkEmailMobile()

    console.log(
      '取得註冊狀態\n',
      '是否註冊過: ',
      noRegister,
      ', 郵件是否使用過: ',
      noEmail,
      ', 手機是否使用過: ',
      noMobile
    )

    // 沒有註冊過
    if (noRegister) {
      console.log(' 新增註冊的會員 ')
      // 新增註冊的會員
      const { result, token } = await insertUser()

      // 有註冊才寄信
      if (result.length > 0) {
        console.log('註冊結果: ', result.length > 0, email)

        res.json({
          success: true,
          msg: '註冊成功！請不要去信箱查看，因為不會寄認證信件。',
          data: null,
        })

        console.log(' 寄出認證信 ')

        // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
        // 因為透過 GET 要 encodeURIComponent 加密過的 TOKEN，接 token 才能拿到正確的值
        const apiUrl = `http://${req.headers.host}/members/userAuth?token=`

        // 先將會員資料用 JSON.stringify 轉成字串，然後 encry 加密，最後 encodeURIComponent
        const encodeToken = `${encodeURIComponent(token)}`
        const data = apiUrl + encodeToken

        // console.log('  req.headers.host', req.headers.host)
        console.log('  url:', data)

        emailService.send({ to: email, data: data })
      }
    } else {
      res.json({
        success: false,
        msg: '抱歉，註冊失敗！',
        data: {
          noEmail: noEmail ? null : '信箱已經使用過！',
          noMobile: noMobile ? null : '手機已經使用過！',
        },
      })
    }
  },

  // 帳號驗證
  async userAuth(req, res, next) {
    const { token } = req.query

    // 拿 token 去找有沒有會員
    let QUERY_SQL = `SELECT * FROM members WHERE token = ?`
    const [row] = await db.query(QUERY_SQL, [token])
    const data = row[0]

    console.log('sid: ', data.sid)

    // 透過 sid 將會員的 status 設定成 1，代表啟用。
    const STATUS_SQL = 'UPDATE `members` set status = 1 WHERE sid = ?'
    const [{ changedRows, affectedRows }] = await db.query(STATUS_SQL, [
      data.sid,
    ])

    // changedRows: 1 代表更新成功, 0 沒有更新
    // affectedRows: 1 代表有這筆資料, 0 沒有這筆資料

    if (changedRows === 1) {
      res.send(`
        <div style="
          box-sizing: border-box;
          position: relative;
          max-width: 480px;
          margin: 0 auto;
          padding: 134px 0 96px;
          text-align: center;
        ">
          <h1>會員認證成功</h1>
        </div>
      `)
    }

    if (changedRows === 0 && affectedRows === 1) {
      res.send(`
      <div style="
        box-sizing: border-box;
        position: relative;
        max-width: 480px;
        margin: 0 auto;
        padding: 134px 0 96px;
        text-align: center;
      ">
        <h1>會員已認證成功</h1>
      </div>
    `)
    }
  },

  // 測試
  async loginTest(req, res, next) {
    // const EXPIRES_IN = 10 * 1000;

    // const token = jwt.sign({ test: 123 }, "YOUR_JWT_SECRET", { expiresIn: EXPIRES_IN });

    // console.log("token", token);
    // res.cookie("token", token, { maxAge: EXPIRES_IN, httpOnly: true });

    res.json({})
  },

  async getTest(req, res, next) {
    const { test } = req.query
    console.log(123, 'decodeURI(test)', decodeURI(test))
    console.log(JSON.stringify(req.cookie), JSON.stringify(req.cookies))

    res.json({})
  },
}

/**
 *
 * cURL 可以直接打 api

pass
    curl -X POST -H "Content-Type: application/json" -d \
    '{ "email" : "register@pass.com", "mobile" : "PASS" }' \
    "http://localhost:3001/members/register"

email
    curl -X POST -H "Content-Type: application/json" -d \
    '{ "email" : "fsjn7w92@srqbrmhi.com", "mobile" : "Jack" }' \
    "http://localhost:3001/members/register"

mobile
    curl -X POST -H "Content-Type: application/json" -d \
    '{ "email" : "123", "mobile" : "0993306275" }' \
    "http://localhost:3001/members/register"


        curl -X POST -H "Content-Type: application/json" -d \
    '{}' \
    "http://localhost:3001/members/loginTest"


     curl -X POST -H "Content-Type: application/json" -d \
    '{"name":"test","mobile":"0928555655","birthday":"2020-11-04","address":"test","email":"enter3017sky@gmail.com","password":"999"}' \
    "http://localhost:3001/members/register"



*/
