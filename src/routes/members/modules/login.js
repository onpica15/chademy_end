class Login {
  constructor(email, password) {
    this.email = email
  }

  getSQL() {
    //讀取資料指回傳部分欄位
    let sql = `SELECT * FROM members WHERE email = '${this.email}'`
    return sql
  }
}

module.exports = Login
