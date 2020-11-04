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

// const EXPIRES_IN = 15 * 1000 // NOTE: 測試用 10 秒
const EXPIRES_IN = 1 * 60 * 60 * 1000 // 過期時間一小時

// 登入驗證 token
function getAuthToken(data) {
  return jwt.sign({ ...data }, process.env.TOKEN_SECRET)
}

// 導出模組
module.exports = {
  // 登入
  async login(req, res, next) {
    let Member = new Login(req.body.email) // 之後需要加密 encry
    const [response] = await db.query(Member.getSQL())

    console.log(response)

    if (response.length) {
      // 比對解密後的密碼是否相同
      const passwordEqual =
        decrypt(response[0].password) === decrypt(encry(req.body.password))

      // otherData: 除了 password 的其他資料，前端登入後不需要知道密碼
      const { password, ...otherData } = response[0]

      // 將其他資料在 data 中展開
      const data = { ...otherData, authToken: getAuthToken(response) }

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
    // 取出 email, mobile，驗證是否註冊過
    const { email, mobile } = req.body

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

      console.log(789, data)

      const result = await db.query('INSERT INTO `members` set ?', [data])

      // 把存入 db 的資料拿來生成認證信箱的 token
      const token = encry(JSON.stringify(data))

      // 然後透過 sid 將 [認證信 token] 更新到資料庫
      const [{ insertId }] = result
      const UPDATE_TOKEN_SQL = 'UPDATE `members` SET token = ? WHERE sid = ?'
      await db.query(UPDATE_TOKEN_SQL, [token, insertId])

      // 返回以下資料
      return { result, token }
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
      // 新增註冊的會員
      const { result, token } = await insertUser()

      console.log(' 新增註冊的會員 => ', result)

      // 有註冊才寄信
      if (result.length > 0) {
        console.log('註冊結果: ', result.length > 0, email)

        res.json({
          success: true,
          msg: '註冊成功！請去信箱查看會員認證信件。',
          data: null,
        })

        console.log(' 寄出認證信 ')

        // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
        // 因為透過 GET 要 encodeURIComponent 加密過的 TOKEN，接 token 才能拿到正確的值
        const apiUrl = `http://${req.headers.host}/members/userAuth?token=`

        // 先將會員資料用 JSON.stringify 轉成字串，然後 encry 加密，最後 encodeURIComponent
        const encodeToken = `${encodeURIComponent(token)}`
        const data = apiUrl + encodeToken

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
    const [[userData]] = await db.query(QUERY_SQL, [token])

    // 找不到會員
    if (!userData) {
      res.send(`
        <h1 style="
          text-align: center;
          margin-top: 30vh;
        ">查無會員</h1>
      `)

      return
    }

    // 透過 sid 將會員的 status 設定成 1，代表啟用。
    const STATUS_SQL = 'UPDATE `members` SET status = 1 WHERE sid = ?'
    const [{ changedRows, affectedRows }] = await db.query(STATUS_SQL, [
      userData.sid,
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
    console.log(' => loginTest ')

    res.json({ success: '測試成功' })
  },

  async getTest(req, res, next) {
    const { test } = req.query
    console.log(123, 'decodeURI(test)', decodeURI(test))
    console.log(JSON.stringify(req.cookie), JSON.stringify(req.cookies))

    res.json({})
  },

  // 忘記密碼
  async forgetPwd(req, res) {
    let email = req.body.email

    // 拿 token 去找有沒有會員
    let QUERY_SQL = `SELECT token FROM members WHERE email = ?`
    const [row] = await db.query(QUERY_SQL, [email])

    if (!row.length) {
      return res.json({
        success: false,
        msg: '寄送失敗，這個信箱還未註冊過',
        data: null,
      })
    }

    const options = {
      to: email,
      subject: 'Chademy 會員身分重設密碼',
      html: `
        <h1>親愛的Chademy會員您好:</h1><br>
        <h3>請點擊下方進行重新設定密碼</h3><br>
        <a href="http://localhost:3000/reset-password?token=${row[0].token}">
          <h2>重設密碼頁</h2>
        </a>`,
    }

    emailService.send(options).then(() => {
      // 寄信成功後
      res.json({
        success: true,
        msg: '請到信箱修改密碼',
        data: null,
      })
    })
  },

  //修改會員密碼
  async changePassword(req, res, next) {
    let email = req.body.email
    let password = req.body.password
    // console.log(number, password);
    let sql = `UPDATE members SET password = '${password}' WHERE email = '${email}' `

    db.query(sql, (err, row) => {
      if (err) return res.json({ err: err })
      // console.log(row);
      if (row.changedRows == 0) {
        res.json({
          success: false,
          msg: '信箱有誤',
          data: null,
        })
        return
      } else {
        res.json({
          success: true,
          msg: '完成密碼更新',
          data: null,
        })
      }
    })
  },

  // 更新密碼
  async resetPWD(req, res, next) {
    const token = req.body.token
    const password = req.body.password

    // 確認 token
    const QUERY_SQL = `SELECT email FROM members WHERE token = ?`
    const [emailRow] = await db.query(QUERY_SQL, [token])

    console.log(emailRow, emailRow[0])

    if (!emailRow.length) {
      res.json({
        success: false,
        msg: '密碼更新失敗',
        data: emailRow[0],
      })
      return
    }

    // 確認 token

    const UPDATE_PWD_SQL = 'UPDATE `members` SET password = ? WHERE token = ?'
    const [row] = await db.query(UPDATE_PWD_SQL, [encry(password), token])

    console.log(row)

    res.json({
      success: true,
      msg: '密碼更新成功',
      data: row[0],
    })
  },
}

//用token查詢email，再去修改密碼

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



     curl -X POST -H "Content-Type: application/json" -d \
    '{ "email":"enter3017sky@gmail.com" }' \
    "http://localhost:3001/members/forgetPwd"

     curl -X POST -H "Content-Type: application/json" -d \
    '{ "email":"enter3017sky@gmail.com" }' \
    "http://localhost:3001/members/resetPWD"



*/
