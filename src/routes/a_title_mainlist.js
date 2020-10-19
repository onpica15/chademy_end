// ---------------------------以下引入模組-------------------------------

const express = require("express");
const router = express.Router();
const db = require(__dirname + "/../db_connect2");
const moment = require("moment-timezone");
const multer = require("multer");
const upload = require(__dirname + "/../upload-img-module");
const fs = require("fs");

// ----------------------以下為重構之function----------------------------

// get data頁碼
async function getListData(req) {
  const output = {
    page: 0,
    perPage: 5,
    totalRows: 0,
    totalPages: 0,
    rows: [],
    pages: [],
  };

  const [[{ totalRows }]] = await db.query(
    "SELECT COUNT(1) totalRows FROM a_title_mainlist"
  );
  if (totalRows > 0) {
    let page = parseInt(req.query.page) || 1;
    output.totalRows = totalRows;
    output.totalPages = Math.ceil(totalRows / output.perPage);

    if (page < 1) {
      output.page = 1;
    } else if (page > output.totalPages) {
      output.page = output.totalPages;
    } else {
      output.page = page;
    }

    (function (page, totalPages, prevNum) {
      let beginPage, endPage;
      if (totalPages <= prevNum * 2 + 1) {
        beginPage = 1;
        endPage = totalPages;
      } else if (page - 1 < prevNum) {
        beginPage = 1;
        endPage = prevNum * 2 + 1;
      } else if (totalPages - page < prevNum) {
        beginPage = totalPages - (prevNum * 2 + 1);
        endPage = totalPages;
      } else {
        beginPage = page - prevNum;
        endPage = page + prevNum;
      }
      output.beginPage = beginPage;
      output.endPage = endPage;
    })(page, output.totalPages, 3);

    let sql = `SELECT * FROM a_title_mainlist LIMIT ${
      (output.page - 1) * output.perPage
    }, ${output.perPage}`;

    const [results] = await db.query(sql);
    results.forEach((el) => {
      el.created_at = moment(el.created_at).format("YYYY-MM-DD");
    });
    output.rows = results;
  }

  return output;
}

async function getEditList(req) {
  const output = {
    cates: [],
    row: [],
  };

  const sql_cates = `SELECT * FROM a_title_category`;

  const sql = "SELECT * FROM a_title_mainlist WHERE sid=?";

  [output.cates] = await db.query(sql_cates);

  const [results] = await db.query(sql, [req.params.sid]);
  output.row = results[0];
  // length>0 則為true
  if (!results.length) {
    // return用意是讓function結束，下面不執行
    return res.redirect("/a_title_mainlist/list");
  }

  results[0].created_at = moment(results[0].created_at).format("YYYY-MM-DD");

  return output;
}

// -----------------畫面3個：列表頁面、編輯頁面、新增頁面--------------------

// 列表頁面
router.get("/list", async (req, res) => {
  const output = await getListData(req);
  res.render("a_title_mainlist/list", output);
});

// 編輯頁面
router.get("/edit/:sid", async (req, res) => {
  const output = await getEditList(req);
  res.render("a_title_mainlist/edit", output);
});

// 新增頁面
router.get("/add", async (req, res) => {
  const output = {
    cates: [],
  };

  const sql_cates = `SELECT * FROM a_title_category`;

  [output.cates] = await db.query(sql_cates);

  res.render("a_title_mainlist/add", output);
});

// ------------------------- 以下為 RESTful API------------------------------

// 編輯表單 PI
router.post("/edit/:sid", upload.none(), async (req, res) => {
  const data = {
    ...req.body,
  };

  const sql = "UPDATE `a_title_mainlist` SET ? WHERE `sid`=?";
  const [{ affectedRows, changedRows }] = await db.query(sql, [
    data,
    req.params.sid,
  ]);

  //  {"fieldCount":0,"affectedRows":1,"insertId":0,"info":"Rows matched: 1  Changed: 0  Warnings: 0","serverStatus":2,"warningStatus":0,"changedRows":0}

  res.json({
    success: !!changedRows,
    affectedRows,
    changedRows,
  });
});

// 單張圖片上傳 API
router.post("/try-upload", upload.single("myfile"), (req, res) => {
  console.log("req.file" + req.file);

  if (req.file && req.file.originalname) {
    let ext = "";

    switch (req.file.mimetype) {
      case "image/png":
      case "image/jpeg":
      case "image/gif":
        fs.rename(
          req.file.path,
          __dirname + "/../public/img/" + req.file.originalname,
          (error) => {
            return res.json({
              success: true,
              path: "/img/" + req.file.originalname,
              newFileName: req.file.filename,
            });
          }
        );

        break;
      default:
        fs.unlink(req.file.path, (error) => {
          return res.json({
            success: false,
            msg: "不是圖檔",
          });
        });
    }
  } else {
    return res.json({
      success: false,
      msg: "沒有上傳檔案",
    });
  }
});

// 新增表單 API
router.post("/add", upload.none(), async (req, res) => {
  const data = {
    ...req.body,
  };

  const sql = "INSERT INTO `a_title_mainlist` set ?";
  const [{ affectedRows, insertId }] = await db.query(sql, [data]);
  // sql是語法一個問號即可，data是array
  // [{"fieldCount":0,"affectedRows":1,"insertId":860,"info":"","serverStatus":2,"warningStatus":1},null]

  res.json({
    success: !!affectedRows,
    affectedRows,
    insertId,
  });
});

// 資料刪除 API
router.delete("/del/:sid", async (req, res) => {
  const sql = "DELETE FROM `a_title_mainlist` WHERE sid=?";
  const [results] = await db.query(sql, [req.params.sid]);
  res.json(results);
});

module.exports = router;
