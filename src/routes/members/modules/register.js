module.exports = class Register {
  constructor({ email, mobile, password }) {
    this.email = email
    this.mobile = mobile
    this.password = password
  }
  getSQL() {
    //讀取資料指回傳部分欄位
    let sql = `
      SELECT
        sid, name, avatar, email, password, birthday,
        mobile, address, visa, status, created_at
      FROM
        members
      WHERE
        email = '${this.email}' AND password = '${this.password}'`
    return sql
  }

  queryEmail() {
    let sql = `SELECT email FROM members WHERE email = '${this.email}'`
    return sql
  }

  queryMobile() {
    let sql = `SELECT mobile FROM members WHERE mobile = '${this.mobile}'`
    return sql
  }
}
