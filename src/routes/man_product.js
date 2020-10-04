const express = require("express");
const router = express.Router();
const db = require(__dirname + "/../db_connect2");
const moment = require("moment-timezone");
const upload = require(__dirname + "/../upload-img-module");



// 畫面

router.get("/list", async (req, res) => {
  const output = {
    rows: [],
  };
  let sql = `SELECT * FROM w_product_mainlist ORDER BY sid  LIMIT 10`;
  const [results] = await db.query(sql);
  output.rows = results;
  results.forEach((el) => {
    el.last_edit_time = moment(el.last_edit_time).format("YYYY-MM-DD");
    el.on_shelf_time = moment(el.on_shelf_time).format("YYYY-MM-DD");
    el.off_shelf_time = moment(el.off_shelf_time).format("YYYY-MM-DD");
  });
  res.render("man_product/man_product_list", output);
});




router.get("/edit/:sid", async (req, res) => {

  const output = {
    cates: [],
    colors: [],
    row: [],
    chair_body: [],
    chair_seat: [],
    designer: []
  };

  const sql_cates = `SELECT * FROM w_product_categories`;
  const sql_color = `SELECT * FROM w_chair_color`;
  const sql_chair_body = `SELECT * FROM w_chair_body`;
  const sql_chair_seat = `SELECT * FROM w_chair_seat`;
  const sql_chair_designer = `SELECT * FROM w_chair_designer`;
  const sql = "SELECT * FROM w_product_mainlist WHERE sid=?";

  [output.cates] = await db.query(sql_cates);
  [output.colors] = await db.query(sql_color);
  [output.chair_body] = await db.query(sql_chair_body);
  [output.chair_seat] = await db.query(sql_chair_seat);
  [output.designer] = await db.query(sql_chair_designer);

  const [results] = await db.query(sql, [req.params.sid]);
  output.row = results[0];
  // length>0 則為true
  if (!results.length) {
    // return用意是讓function結束，下面不執行
    return res.redirect("/man_product/list");
  }

  results[0].last_edit_time = moment(results[0].last_edit_time).format(
    "YYYY-MM-DD"
  );
  results[0].on_shelf_time = moment(results[0].on_shelf_time).format(
    "YYYY-MM-DD"
  );
  results[0].off_shelf_time = moment(results[0].off_shelf_time).format(
    "YYYY-MM-DD"
  );

  // res.send(results[0]);
  res.render("man_product/man_product_edit", output);
});




router.get("/add", async (req, res) => {
  const output = {
    cates: [],
    colors: [],
    chair_body: [],
    chair_seat: [],
    designer: []
  };

  const sql_cates = `SELECT * FROM w_product_categories`;
  const sql_color = `SELECT * FROM w_chair_color`;
  const sql_chair_body = `SELECT * FROM w_chair_body`;
  const sql_chair_seat = `SELECT * FROM w_chair_seat`;
  const sql_chair_designer = `SELECT * FROM w_chair_designer`;

  [output.cates] = await db.query(sql_cates);
  [output.colors] = await db.query(sql_color);
  [output.chair_body] = await db.query(sql_chair_body);
  [output.chair_seat] = await db.query(sql_chair_seat);
  [output.designer] = await db.query(sql_chair_designer);

  // output.cates = results;
  // res.json(output.cates);
  res.render("man_product/man_product_add", output);
});




// RESTful API

router.post('/edit/:sid', upload.none(), async (req, res) => {
  const data = {
    ...req.body
  };
  data.last_edit_time = moment(new Date()).format(
    "YYYY-MM-DD");
  const sql = "UPDATE `w_product_mainlist` SET ? WHERE `sid`=?";
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

router.post('/add', upload.none(), async (req, res) => {
  const data = {
    ...req.body
  };
  data.last_edit_time = moment(new Date()).format(
    "YYYY-MM-DD");

  // res.json(data);


  const sql = "INSERT INTO `w_product_mainlist` set ?";
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

router.delete("/del/:sid", async (req, res) => {
  const sql = "DELETE FROM `w_product_mainlist` WHERE sid=?";
  const [results] = await db.query(sql, [req.params.sid]);
  res.json(results);
});

// 記得加這句呀～module匯出index才能用呀～
module.exports = router;