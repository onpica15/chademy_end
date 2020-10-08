// -----------------------以下開始引入套件、模組設定------------------------
const express = require("express"); //express
const db = require(__dirname + "/db_connect2"); // 引用模組，模組裡安裝mysql2
const moment = require('moment-timezone');
const upload = require(__dirname + "/upload-img-module");



// -------------------以下開始物件、top use middleware設定------------------------

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


// -------------------------------以下開始路由設定------------------------

// 首頁路由
app.get("/", (req, res) => {
  res.send("首頁");
});

// 引入產品路由
app.use("/product", require(__dirname + "/routes/product"));
app.use("/man_product", require(__dirname + "/routes/man_product"));

// 引入二手路由
app.use("/secondhand", require(__dirname + "/routes/secondhand"));
app.use("/man_secondhand", require(__dirname + "/routes/man_secondhand"));

// 引入募資路由



// 引入競標路由



// 引入課程路由



// 引入品牌故事路由



// 引入部落格路由



// 引入會員路由



// 引入購物車路由



// public 資料夾middleware
app.use(express.static(__dirname + "/../public"));


// 404 middleware
app.use((req, res) => {
  res.type("text/plain").status(404).send("查無此頁");
});




// -------------------------------以下開始伺服器監聽------------------------

app.listen(3000, () => {
  console.log("伺服器已啟動");
});
