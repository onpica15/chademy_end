
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
  ] = await db.query("SELECT COUNT(1) totalRows FROM e_fund_project");
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

    let sql = `SELECT * FROM e_fund_project LIMIT ${(output.page-1)*output.perPage}, ${output.perPage}`;

    const [results] = await db.query(sql);
    results.forEach(el => {
      el.e_start_time = moment(el.e_start_time).format("YYYY-MM-DD");
      el.e_end_time = moment(el.e_end_time).format("YYYY-MM-DD");
      el.e_realize_time= moment(el.e_realize_time).format("YYYY-MM-DD");
    });
    output.rows = results;
  }

  return output;
};

async function getEditList(req) {
  const output = {
    cates: [],
    row: [],
    
  };

  const sql_cates = `SELECT * FROM e_fund_categories`;
  
  const sql = "SELECT * FROM e_fund_project WHERE sid=?";

  [output.cates] = await db.query(sql_cates);
  

  const [results] = await db.query(sql, [req.params.sid]);
  output.row = results[0];
  // length>0 則為true
  if (!results.length) {
    // return用意是讓function結束，下面不執行
    return res.redirect("/man_fund/list");
  }

  results[0].e_start_time = moment(results[0].e_start_time).format(
    "YYYY-MM-DD"
  );
  results[0].e_end_time = moment(results[0].e_end_time).format(
    "YYYY-MM-DD"
  );
  results[0].e_realize_time = moment(results[0].e_realize_time).format(
    "YYYY-MM"
  );
  return output;
}




// -----------------畫面3個：列表頁面、編輯頁面、新增頁面--------------------


// 列表頁面
router.get("/list", async (req, res) => {
  const output = await getListData(req);
  res.render("man_fund/list", output);
});

// react
router.post("/fundlistnode", async (req, res) => {
 if (!req.session.sid) return res.status(401).send('請重新登入')

 let sql = 'SELECT * FROM e_fund_project WHERE member_sid = ?'
 const [row] = await db.query(sql, [req.session.sid]);

 console.log(' row => ', row, 'member id => ', req.session.sid)

  res.json({
    success: !!row.length > 0,
    msg: '募資資料查詢成功',
    data: row,
  })
});


// router.get("/fundlistnode/membersid", async (req, res, next) => {

//   let sql = `SELECT * FROM e_fund_project WHERE member_sid=?`;

 
//   const [results] = await db.query(sql, [req.query.member]);

//   res.json(results);

// });



router.get("/myfund/:sid", async (req, res) => {

  const { sid } = req.params

  console.log(sid,'123' )
  const sql = `
  SELECT * 
  FROM e_fund_project 
  WHERE member_sid = ? 
  ORDER BY e_fund_project.sid ASC`
  const [row] = await db.query(sql, [sid]);


  console.log('   get   =>  ', row)
  // res.json(row); // [{}]

  res.json({
    success: !!row.length > 0,
    msg: '募資資料查詢成功',
    data: row,
  })
});





// 系列
router.get("/series", async (req, res) => {
  if(req.query.category){
  const series = req.query.category
  let sql = `SELECT * FROM e_fund_project WHERE e_cate = ` + series
  console.log('sql: '+sql);
  console.log('series'+series);
  console.log('req.query'+req.query);
  
  const [totalRows
  ] = await db.query(sql);
  res.json(totalRows);
}
})

// 專案新舊
router.get("/project_time", async (req, res) => {
  if(req.query.time){
  const time = req.query.time
  let sql = `SELECT * FROM e_fund_project WHERE project_cate = ` + time
  console.log('sql: '+sql);
  console.log('time'+time);
  console.log('req.query'+req.query);
  
  const [totalRows
  ] = await db.query(sql);
  res.json(totalRows);
}
})

//價錢由低到高
// router.get("/project_price_asc", async (req, res) => {
//   if(req.query){
//   // const acs = req.query.asc
//   let sql = `SELECT * FROM e_fund_project WHERE e_lowprice ASC `
//   console.log('sql: '+sql);
//   // console.log('asc'+asc);
//   console.log('req.query'+req.query);
  
//   const [totalRows
//   ] = await db.query(sql);
//   res.json(totalRows);
// }
// })

//
router.get("/project_price_asc", async (req, res) => {
  const sql = "SELECT * FROM e_fund_project ORDER BY e_fund_project.e_lowprice ASC";


  const [totalRows
       ] = await db.query(sql);
      res.json(totalRows);  
  // const [row] = await db.query(sql, [req.params.sid]);
  // res.json(row); // [{}]
});


//價錢由高到低
// router.get("/project_price_desc", async (req, res) => {
//   if(req.query){
//   // const desc = req.query.desc
//   let sql = `SELECT * FROM e_fund_project WHERE e_lowprice DESC ` 
//   console.log('sql: '+sql);
//   // console.log('desc'+desc);
//   console.log('req.query'+req.query);
  
//   const [totalRows
//   ] = await db.query(sql);
//   res.json(totalRows);
// }
// })
router.get("/project_price_desc", async (req, res) => {
  const sql = "SELECT * FROM e_fund_project ORDER BY e_fund_project.e_lowprice DESC";
  const [totalRows
  ] = await db.query(sql);
 res.json(totalRows);  
  // const [row] = await db.query(sql, [req.params.sid]);
  // res.json(row); // [{}]
});


//react
// router.get("/fundlistnew", async (req, res) => {
 
//   let sql = `SELECT * FROM e_fund_project ORDER BY project_cate ASC`;
//   const [results] = await db.query(sql);
 
//   res.json(results);
// });



// funditem
router.get("/reactitem/:sid", async (req, res) => {
  
  const sql = "SELECT * FROM e_fund_project WHERE sid=?";
  const [row] = await db.query(sql, [req.params.sid]);
  res.json(row); // [{}]
});




// get 追蹤狀態
router.get("/heart/:sid", async (req, res) => {
  
  const sql = "SELECT * FROM `e_follow` WHERE follow_project=?";
  const [row] = await db.query(sql, [req.params.sid]);

  res.json(row); // [{}]
});

// 加入追蹤 API
router.post('/addheart', upload.none(), async (req, res) => {
  const data = {
    ...req.body
  };
  data.follow_time = moment(new Date()).format(
    "YYYY-MM-DD");

  const sql = "INSERT INTO `e_follow` set ?";
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


// 刪除追蹤 API
router.delete("/del/:sid", async (req, res) => {
  const sql = "DELETE FROM `e_follow` WHERE follow_project=?";
  const [results] = await db.query(sql, [req.params.sid]);
  res.json(results);
});







// 編輯頁面
router.get("/edit/:sid", async (req, res) => {
  const output = await getEditList(req);
  res.render("man_fund/edit", output);
});



// 新增頁面
router.get("/add", async (req, res) => {


  const output = {
    cates: [],
    
  };

  const sql_cates = `SELECT * FROM e_fund_categories`;
  

  [output.cates] = await db.query(sql_cates);
  

 
  res.render("man_fund/add", output);
});




// ------------------------- 以下為 RESTful API------------------------------


// 編輯表單 API
router.post('/edit/:sid', upload.none(), async (req, res) => {
  const data = {
    ...req.body
  };
  data.last_edit_time = moment(new Date()).format(
    "YYYY-MM-DD");
  const sql = "UPDATE `e_fund_project` SET ? WHERE `sid`=?";
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


// 新增表單 API
router.post('/add', upload.none(), async (req, res) => {
  const data = {
    ...req.body,
    product_type: 3
  };

  delete data.sid

  console.log(999, req.body)

  const sql = "INSERT INTO `e_fund_project` set ?";
  console.log(JSON.stringify(data));
  const [{
    affectedRows,
    insertId
  }] = await db.query(sql, [data]);

  res.json({
    success: !!affectedRows,
    msg: !!affectedRows ? 'success' : 'failed',
    affectedRows,
    insertId,
  });
});


// 資料刪除 API
router.delete("/del/:sid", async (req, res) => {

  const sql = "DELETE FROM `e_fund_project` WHERE sid=?";


  const [results] = await db.query(sql, [req.params.sid]);
  res.json(results);
});


// -------------------------------- 以下匯出模組------------------------------


// 記得加這句呀～module匯出index才能用呀～
module.exports = router;