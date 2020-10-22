const express = require("express");
const router = express.Router();
const db = require(__dirname + "/../db_connect2");
const moment = require("moment-timezone");
const multer = require("multer");
const upload = require(__dirname + "/../upload-img-module");
const fs = require("fs");

// get data頁碼
async function getListData(req) {
  const output = {
    page: 0,
    perPage: 10,
    totalRows: 0,
    totalPages: 0,
    rows: [],
    pages: []
  };

  const [
    [{
      totalRows
    }]
  ] = await db.query("SELECT COUNT(1) totalRows FROM i_secondhand_product");
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

    let sql = `SELECT * FROM i_secondhand_product LIMIT ${(output.page-1)*output.perPage}, ${output.perPage}`;

    const [results] = await db.query(sql);
    results.forEach(el => {
      el.last_edit_time = moment(el.last_edit_time).format("YYYY-MM-DD");
      el.on_shelf_time = moment(el.on_shelf_time).format("YYYY-MM-DD");
      el.off_shelf_time = moment(el.off_shelf_time).format("YYYY-MM-DD");
    });
    output.rows = results;
  }

  return output;
};

// 畫面

router.get("/list", async (req, res) => {
  const output = {
    rows: [],
  };
  let sql = `SELECT * FROM i_secondhand_product ORDER BY sid  LIMIT 10`;
  const [results] = await db.query(sql);
  output.rows = results;
//   results.forEach((el) => {
//     el.last_edit_time = moment(el.last_edit_time).format("YYYY-MM-DD");
//     el.on_shelf_time = moment(el.on_shelf_time).format("YYYY-MM-DD");
//     el.off_shelf_time = moment(el.off_shelf_time).format("YYYY-MM-DD");
//   });
  res.render("man_secondhand/man_secondhand_list", output);
});



router.get("/edit/:sid", async (req, res) => {

  const output = {
    conditions: [],
    categories: [],
    material: [],
    framework: [],
    row:[]
  };

  const sql_conditions = `SELECT * FROM i_secondhand_conditions`;
  const sql_categories = `SELECT * FROM i_secondhand_categories`;
  const sql_material = `SELECT * FROM i_secondhand_material`;
  const sql_framework = `SELECT * FROM i_secondhand_framework`;
  const sql = "SELECT * FROM i_secondhand_product WHERE sid=?";
 

  [output.conditions] = await db.query(sql_conditions);
  [output.categories] = await db.query(sql_categories);
  [output.material] = await db.query(sql_material);
  [output.framework] = await db.query(sql_framework);


  const [results] = await db.query(sql, [req.params.sid]);
  output.row = results[0];
  // length>0 則為true
  if (!results.length) {
    // return用意是讓function結束，下面不執行
    return res.redirect("/man_secondhand/list");
  }

  // res.send(results[0]);
  res.render("man_secondhand/man_secondhand_edit", output);
});


router.get("/add", async (req, res) => {
  const output = {
    conditions: [],
    categories: [],
    material: [],
    framework: []
  };

  const sql_conditions = `SELECT * FROM i_secondhand_conditions`;
  const sql_categories = `SELECT * FROM i_secondhand_categories`;
  const sql_material = `SELECT * FROM i_secondhand_material`;
  const sql_framework = `SELECT * FROM i_secondhand_framework`;
 

  [output.conditions] = await db.query(sql_conditions);
  [output.categories] = await db.query(sql_categories);
  [output.material] = await db.query(sql_material);
  [output.framework] = await db.query(sql_framework);


  // output.cates = results;
  // res.json(output.cates);
  res.render("man_secondhand/man_secondhand_add", output);
});




// RESTful API

router.post('/add', upload.none(), async (req, res) => {
  const data = {
    ...req.body
  };
  const sql = "INSERT INTO `i_secondhand_product` set ?";
  const [{
    affectedRows,
    insertId
  }] = await db.query(sql, [data]);
  // sql是語法一個問號即可，data是array
  // [{"fieldCount":0,"affectedRows":1,"insertId":860,"info":"","serverStatus":2,"warningStatus":1},null]

  res.json({
    success: !!affectedRows,
    affectedRows,
    insertId,
  });
});


router.post('/edit/:sid', upload.none(), async (req, res) => {
  const data = {
    ...req.body
  };
  
  const sql = "UPDATE `i_secondhand_product` SET ? WHERE `sid`=?";
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




router.delete("/del/:sid", async (req, res) => {
  const sql = "DELETE FROM `i_secondhand_product` WHERE sid=?";
  const [results] = await db.query(sql, [req.params.sid]);
  res.json(results);
});

// 記得加這句呀～module匯出index才能用呀～
module.exports = router;