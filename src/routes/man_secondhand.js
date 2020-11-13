const express = require("express");
const router = express.Router();
const db = require(__dirname + "/../db_connect2");
const moment = require("moment-timezone");
const multer = require("multer");
const upload = require(__dirname + "/../upload-img-module");
const fs = require("fs");

//MVC
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

/**
 * get broduct by category id
 */
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

//react
router.get("/secondhandlist", async (req, res) => {
 
  let sql = `SELECT * FROM i_secondhand_product ORDER BY sid DESC`;
  const [results] = await db.query(sql);
 
  res.json(results);
});

// 產品頁面
router.get("/secondhandlist/:sid", async (req, res) => {
  const sql = "SELECT * FROM i_secondhand_product WHERE sid=?";
  const [row] = await db.query(sql, [req.params.sid]);
  res.json(row); // [{}]
});

//猜你喜歡
router.get("/relate/:sid", async (req, res) => {
  const sql = "SELECT * FROM i_secondhand_product WHERE categories_sid=?";
  const [row] = await db.query(sql, [req.params.sid]);
  res.json(row); // [{}]
});


//review_member
router.post('/review_member', upload.none(),async (req, res) => {
  const data = {
    ...req.body
  };
  data.review_time = moment(new Date()).format(
    "YYYY-MM-DD");
  const sql = "INSERT INTO `i_comment_c2c` set ?";
  console.log(JSON.stringify(data));
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

//get memberRevirw
router.get("/member_star/:sid", async (req, res) => {
  const sql = "SELECT * FROM i_comment_c2c WHERE seller_sid=?";
  const [row] = await db.query(sql, [req.params.sid]);
  res.json(row); // [{}]
});

//get member data
router.get("/member_data", async (req, res) => {
  const sql = "SELECT * FROM `members`";
  const [row] = await db.query(sql, [req.params.sid]);
  res.json(row); // [{}]
});

//myproduct
router.get("/myproduct/:sid", async (req, res) => {
  const sql = "SELECT * FROM `i_secondhand_product` WHERE member_sid=?  ";
  const [row] = await db.query(sql, [req.params.sid]);
  res.json(row); // [{}]
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

router.get('/product/category/:sid',  async(req, res) => {
  const baseSql = 
    `SELECT * FROM i_secondhand_product where categories_sid = ${req.params.sid}`;
  
  const data = await db.query(baseSql);
  console.log(baseSql);

  res.json({
    data: data[0]
  });
})

const getCondition = (wheres) => {
  if(wheres.length === 0){
    return '';
  }

  return ' where ' + wheres.join(' and ');
}

router.post('/product/category', upload.none(), async(req, res) => {
  const {
    condition_sid,
    category_sid,
    material_sid,
    framework_sid,
    page_no = 0, limit = 8
  } = req.body;

  let baseSql = 
    `SELECT * FROM i_secondhand_product `;
  
  let wheres = [];
    if(condition_sid){
      wheres.push(`conditions_sid = ${condition_sid}`);
    }
    if(category_sid){
      wheres.push(`categories_sid = ${category_sid}`);
    }
    if(material_sid){
      wheres.push(`material_sid = ${material_sid}`);
    }
    if(framework_sid){
      wheres.push(`framework_sid = ${framework_sid}`);
    }

  const where = getCondition(wheres);
  console.log(where);
  if(where){
    baseSql += where;
  }
  baseSql += ` limit ${page_no * limit}, ${limit}`
  
  console.log(baseSql);
  const data = await db.query(baseSql);

  res.json({
    data: data[0]
  });
})

const typeMap = {
  condition: "conditions_sid",
  category: "categories_sid",
  material: "material_sid",
  framework: "framework_sid"
}

router.post('/product',  async(req, res) => {
  const {
    type,
    sid,
    page_no = 0, 
    limit = 8
  } = req.body;

  const columnName = typeMap[type]
  const query = (columnName && sid) ? ` where ${columnName} = ${sid}` : '';
  const baseSql = `SELECT * FROM i_secondhand_product ${query}
  limit ${page_no * limit}, ${limit}`;
  const data = await db.query(baseSql);

  res.json({
    data: data[0]
  });
})

router.post('/add', upload.none(), async (req, res) => {
  const data = {
    ...req.body
  };
  const sql = "INSERT INTO `i_secondhand_product` set ?";
  console.log(JSON.stringify(data));
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