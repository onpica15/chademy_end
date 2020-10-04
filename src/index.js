// 引入模組
const express = require("express"); //express
const db = require(__dirname + "/db_connect2"); // 引用模組，模組裡安裝mysql2
const moment = require('moment-timezone');
const upload = require(__dirname + "/upload-img-module");

// 設定

// 建立app物件
const app = express();

// 解析urlencoded格式middleware
app.use(
  express.urlencoded({
    extended: false,
  })
);
// 解析json格式middleware
app.use(express.json());

// 使用樣版引擎
app.set("view engine", "ejs");

// 路由
app.get("/", (req, res) => {
  res.send("首頁");
});

// 引入產品路由
app.use("/product", require(__dirname + "/routes/product"));
app.use("/man_product", require(__dirname + "/routes/man_product"));

// 伺服器
app.listen(3000, () => {
  console.log("伺服器已啟動");
});
