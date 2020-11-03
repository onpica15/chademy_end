// email
const nodemailer = require('nodemailer')

// email 的模板
const mailTemplate = require(__dirname + '/../template/register')

// 參考文章
// ref: https://cythilya.github.io/2015/08/19/node-nodemailer/

module.exports = function () {
  const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    logger: true, // 可以在 terminal 看 log
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  })

  return {
    send({ to, subject = 'Chademy 會員身分認證通知信', data }) {
      mailTransport.sendMail(
        {
          from: process.env.GMAIL_USER,
          to: to, // 該會員信箱
          subject: subject, // 郵件主旨
          html: mailTemplate(data), // 兩種格式: text/html

          // 為了要在信箱加上 logo
          attachments: [
            {
              filename: 'logo.png', // 檔案名稱
              path: __dirname + '/logo.png', // 檔案路徑
              cid: 'unique@logo', //same cid value as in the html img src
            },
          ],
        },
        (err) => {
          if (err) console.log('Unable to send email: ' + err)
        }
      )
    },
  }
}
