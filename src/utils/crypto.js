const CryptoJS = require('crypto-js')

// 加密 ref: https://stackoverflow.com/questions/28583357/how-to-decrypt-aes-128-in-cryptojs-nodejs-web-browser

module.exports = {
  // 加密
  encry(str) {
    const encrypted = CryptoJS.AES.encrypt(str, process.env.TOKEN_SECRET)
    return encrypted.toString()
  },

  // 解密
  decrypt(encryStr) {
    return CryptoJS.AES.decrypt(encryStr, process.env.TOKEN_SECRET).toString(
      CryptoJS.enc.Utf8
    )
  },
}
