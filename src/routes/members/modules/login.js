class Login {
  constructor(email, password) {
    this.email = email;
    this.password = password;
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
        email = '${this.email}' AND password = '${this.password}'`;
    return sql;
  }
}

module.exports = Login;
