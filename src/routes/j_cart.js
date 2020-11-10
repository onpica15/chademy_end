const express = require('express');
const router = express.Router();
const db = require(__dirname + "/../db_connect2");
const moment = require("moment-timezone");
const multer = require("multer");
const upload = require(__dirname + "/../upload-img-module");
const fs = require("fs");
const { request } = require('http');

// get data頁碼
async function getListData (req){
    const output ={
        page:1,
        perPage:5,
        totalRows:0,
        totalPages:0,
        rows:[]
    }

    const [[{totalRows}]] = await db.query("SELECT COUNT(1) totalRows FROM J_cart_order");
    if(totalRows>0){
        let page = parseInt(req.query.page) || 1;
        output.totalRows = totalRows;
        output.totalPages = Math.ceil(totalRows/output.perPage);
        if(page<1){
            output.page=1;
        }else if(page> output.totalPages){
            output.page = output.totalPages;
        }else{
            output.page = page;
        }
        let sql = `SELECT * FROM J_cart_order ORDER BY sid DESC LIMIT ${(output.page-1)*output.perPage}, ${output.perPage}`;

        const [r2] =await db.query(sql);
        output.rows=r2;
    }
    return output;
}

// 畫面

//get產品api
router.get("/productlist", async (req, res) => {
  const PO_NO = req.query.PO_NO
  console.log(PO_NO)
  let sql = `SELECT * FROM w_product_mainlist`;
  console.log(sql)
  const [row] = await db.query(sql);
  row.forEach(el => {
    el.order_date = moment(el.order_date).format("YYYY-MM-DD");  
  });
  res.json(row);
});
router.get("/orderdetail", async (req, res) => {
  const PO_NO = req.query.PO_NO
  console.log(PO_NO)
  let sql = `SELECT * FROM j_order_detail`;
  console.log(sql)
  const [row] = await db.query(sql);
  row.forEach(el => {
    el.order_date = moment(el.order_date).format("YYYY-MM-DD");  
  });
  res.json(row);
});
//get detail of order
router.get("/detaillist", async (req, res) => {
  const PO_NO = req.query.PO_NO
  console.log(PO_NO)
  let sql = `SELECT * FROM j_order_detail WHERE PO_NO='${PO_NO}'`;
  console.log(sql)
  const [row] = await db.query(sql);
  row.forEach(el => {
    el.order_date = moment(el.order_date).format("YYYY-MM-DD");  
  });
  res.json(row);
});
router.get("/list", async (req, res) => {
  const member = req.query.member
  console.log(member)
  let sql = `SELECT * FROM J_cart_order WHERE member='${member}'`;
  console.log(sql)
  const [row] = await db.query(sql);
  row.forEach(el => {
    el.order_date = moment(el.order_date).format("YYYY-MM-DD");  
  });
  res.json(row);
});

//get pending
router.get("/listpending", async (req, res) => {
  const member = req.query.member
  console.log(member)
  let sql = `SELECT * FROM J_cart_order WHERE (member='${member}')AND(order_status =1)`;
  console.log(sql)
  console.log('pending')
  const [row] = await db.query(sql);
  row.forEach(el => {
    el.order_date = moment(el.order_date).format("YYYY-MM-DD");  
  });
  res.json(row);
});

//get cancel
router.get("/listcancel", async (req, res) => {
  const member = req.query.member
  console.log(member)
  let sql = `SELECT * FROM J_cart_order WHERE (member='${member}')AND(order_status =4)`;
  console.log(sql)
  const [row] = await db.query(sql);
  row.forEach(el => {
    el.order_date = moment(el.order_date).format("YYYY-MM-DD");  
  });
  res.json(row);
});
//get finish
router.get("/listfinish", async (req, res) => {
  const member = req.query.member
  console.log(member)
  let sql = `SELECT * FROM J_cart_order WHERE (member='${member}')AND(order_status =3)`;
  console.log(sql)
  console.log('finish')
  const [row] = await db.query(sql);
  row.forEach(el => {
    el.order_date = moment(el.order_date).format("YYYY-MM-DD");  
  });
  res.json(row);
});


router.get("/add", async (req, res) => {
  const output = {
    product_name: [],
    quantity: []
  };

  const sql_product_name = `SELECT * FROM J_cart_order`;
  const sql_quantity = `SELECT * FROM J_cart_order`;
 

  [output.product_name] = await db.query(sql_product_name);
  [output.quantity] = await db.query(sql_quantity);


  // output.cates = results;
  // res.json(output.cates);
  res.json("j_cart/j_cart_order_detial", output);
});




// RESTful API

router.post('/add', upload.none(), async (req, res) => {
  const data = {
    ...req.body
  };

  console.log(req.body);

  const sql = "INSERT INTO `j_order_detail` set ?";
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

router.post('/addorder', upload.none(), async (req, res) => {
  const data = {
    ...req.body
  };

  console.log(req.body);
  const sql = "INSERT INTO `J_cart_order` set ?";
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

// 記得加這句呀～module匯出index才能用呀～
module.exports = router;