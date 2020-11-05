
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
    pages: []
  };

  const [
    [{
      totalRows
    }]
  ] = await db.query("SELECT COUNT(1) totalRows FROM a_wood_maker");
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

    let sql = `SELECT * FROM a_wood_maker LIMIT ${(output.page - 1) * output.perPage}, ${output.perPage}`;

    const [results] = await db.query(sql);
    results.forEach(el => {
     el.open_time = moment(el.open_time, "kk:mm:ss").format("kk:mm");
     el.close_time = moment(el.close_time, "kk:mm:ss").format("kk:mm");
    });

    output.rows = results;
  }

  return output;
};

async function getEditList(req) {
  const output = {
    row: [],
  };

  const sql = "SELECT * FROM a_wood_maker WHERE sid=?";

  const [results] = await db.query(sql, [req.params.sid]);
  output.row = results[0];
  // length>0 則為true
  if (!results.length) {
    // return用意是讓function結束，下面不執行
    return res.redirect("/a_wood_maker/list");
  }

  results[0].open_time = moment(results[0].open_time, "kk:mm:ss").format(
    "kk:mm"
  );
  results[0].close_time = moment(results[0].close_time, "kk:mm:ss").format(
    "kk:mm"
  );
  return output;
}



// -----------------React：列表頁面、編輯頁面、新增頁面--------------------
// 列表頁面
router.get("/reactlistfour", async (req, res) => {
  const [totalRows
  ] = await db.query("SELECT * FROM `a_wood_maker` WHERE 1 LIMIT 4");
  res.json(totalRows);
});






// -----------------畫面3個：列表頁面、編輯頁面、新增頁面--------------------


// 列表頁面
router.get("/list", async (req, res) => {
  const output = await getListData(req);
  res.render("a_wood_maker/list", output);
});


// 編輯頁面
router.get("/edit/:sid", async (req, res) => {
  const output = await getEditList(req);
  res.render("a_wood_maker/edit", output);
});



router.post('/edit/:sid', upload.none(), async (req, res) => {
  const data = {
    ...req.body
  };

  const sql = "UPDATE `a_wood_maker` SET ? WHERE `sid`=?";
  const [{
    affectedRows,
    changedRows
  }] = await db.query(sql, [data, req.params.sid]);

  //  {"fieldCount":0,"affectedRows":1,"insertId":0,"info":"Rows matched: 1  Changed: 0  Warnings: 0","serverStatus":2,"warningStatus":0,"changedRows":0}

  res.json({
    success: !!changedRows,
    affectedRows,
    changedRows,
  });
});


// 單張圖片上傳 API
router.post("/try-upload", upload.single('myfile'), (req, res) => {
  console.log('req.file' + req.file);

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
              newFileName: req.file.filename
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


// 資料新增修正
router.get("/add", (req, res) => {
  res.render("a_wood_maker/add");
});
router.post("/add", upload.none(), async (req, res) => {
  const data = { ...req.body };
  const sql = "INSERT INTO `a_wood_maker` set ?";
  const [{ affectedRows, insertId }] = await db.query(sql, [data]);
  // [{"fieldCount":0,"affectedRows":1,"insertId":860,"info":"","serverStatus":2,"warningStatus":1},null]

  res.json({
    success: !!affectedRows,
    affectedRows,
    insertId,
  });
});


// 資料刪除 API
router.delete("/del/:sid", async (req, res) => {
  const sql = "DELETE FROM `a_wood_maker` WHERE sid=?";
  const [results] = await db.query(sql, [req.params.sid]);
  res.json(results);
});





module.exports = router;

