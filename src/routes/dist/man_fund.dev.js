"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// ---------------------------以下引入模組-------------------------------
var express = require("express");

var router = express.Router();

var db = require(__dirname + "/../db_connect2");

var moment = require("moment-timezone");

var multer = require("multer");

var upload = require(__dirname + "/../upload-img-module");

var fs = require("fs"); // ----------------------以下為重構之function----------------------------
// get data頁碼


function getListData(req) {
  var output, _ref, _ref2, _ref2$, totalRows, page, sql, _ref3, _ref4, results;

  return regeneratorRuntime.async(function getListData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          output = {
            page: 0,
            perPage: 10,
            totalRows: 0,
            totalPages: 0,
            rows: [],
            pages: []
          };
          _context.next = 3;
          return regeneratorRuntime.awrap(db.query("SELECT COUNT(1) totalRows FROM e_fund_project"));

        case 3:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 1);
          _ref2$ = _slicedToArray(_ref2[0], 1);
          totalRows = _ref2$[0].totalRows;

          if (!(totalRows > 0)) {
            _context.next = 21;
            break;
          }

          page = parseInt(req.query.page) || 1;
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
            var beginPage, endPage;

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

          sql = "SELECT * FROM e_fund_project LIMIT ".concat((output.page - 1) * output.perPage, ", ").concat(output.perPage);
          _context.next = 16;
          return regeneratorRuntime.awrap(db.query(sql));

        case 16:
          _ref3 = _context.sent;
          _ref4 = _slicedToArray(_ref3, 1);
          results = _ref4[0];
          results.forEach(function (el) {
            el.e_start_time = moment(el.e_start_time).format("YYYY-MM-DD");
            el.e_end_time = moment(el.e_end_time).format("YYYY-MM-DD");
            el.e_realize_time = moment(el.e_realize_time).format("YYYY-MM-DD");
          });
          output.rows = results;

        case 21:
          return _context.abrupt("return", output);

        case 22:
        case "end":
          return _context.stop();
      }
    }
  });
}

;

function getEditList(req) {
  var output, sql_cates, sql, _ref5, _ref6, _ref7, _ref8, results;

  return regeneratorRuntime.async(function getEditList$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          output = {
            cates: [],
            row: []
          };
          sql_cates = "SELECT * FROM e_fund_categories";
          sql = "SELECT * FROM e_fund_project WHERE sid=?";
          _context2.next = 5;
          return regeneratorRuntime.awrap(db.query(sql_cates));

        case 5:
          _ref5 = _context2.sent;
          _ref6 = _slicedToArray(_ref5, 1);
          output.cates = _ref6[0];
          _context2.next = 10;
          return regeneratorRuntime.awrap(db.query(sql, [req.params.sid]));

        case 10:
          _ref7 = _context2.sent;
          _ref8 = _slicedToArray(_ref7, 1);
          results = _ref8[0];
          output.row = results[0]; // length>0 則為true

          if (results.length) {
            _context2.next = 16;
            break;
          }

          return _context2.abrupt("return", res.redirect("/man_fund/list"));

        case 16:
          results[0].e_start_time = moment(results[0].e_start_time).format("YYYY-MM-DD");
          results[0].e_end_time = moment(results[0].e_end_time).format("YYYY-MM-DD");
          results[0].e_realize_time = moment(results[0].e_realize_time).format("YYYY-MM");
          return _context2.abrupt("return", output);

        case 20:
        case "end":
          return _context2.stop();
      }
    }
  });
} // -----------------畫面3個：列表頁面、編輯頁面、新增頁面--------------------
// 列表頁面


router.get("/list", function _callee(req, res) {
  var output;
  return regeneratorRuntime.async(function _callee$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(getListData(req));

        case 2:
          output = _context3.sent;
          res.render("man_fund/list", output);

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
}); // react

router.post("/fundlistnode", function _callee2(req, res) {
  var sql, _ref9, _ref10, row;

  return regeneratorRuntime.async(function _callee2$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (req.session.sid) {
            _context4.next = 2;
            break;
          }

          return _context4.abrupt("return", res.status(401).send('請重新登入'));

        case 2:
          sql = 'SELECT * FROM e_fund_project WHERE member_sid = ?';
          _context4.next = 5;
          return regeneratorRuntime.awrap(db.query(sql, [req.session.sid]));

        case 5:
          _ref9 = _context4.sent;
          _ref10 = _slicedToArray(_ref9, 1);
          row = _ref10[0];
          console.log(' row => ', row, 'member id => ', req.session.sid);
          res.json({
            success: !!row.length > 0,
            msg: '募資資料查詢成功',
            data: row
          });

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // router.get("/fundlistnode/membersid", async (req, res, next) => {
//   let sql = `SELECT * FROM e_fund_project WHERE member_sid=?`;
//   const [results] = await db.query(sql, [req.query.member]);
//   res.json(results);
// });

router.get("/myfund/:sid", function _callee3(req, res) {
  var sid, sql, _ref11, _ref12, row;

  return regeneratorRuntime.async(function _callee3$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          sid = req.params.sid;
          console.log(sid, '123');
          sql = "\n  SELECT * \n  FROM e_fund_project \n  WHERE member_sid = ? \n  ORDER BY e_fund_project.sid ASC";
          _context5.next = 5;
          return regeneratorRuntime.awrap(db.query(sql, [sid]));

        case 5:
          _ref11 = _context5.sent;
          _ref12 = _slicedToArray(_ref11, 1);
          row = _ref12[0];
          console.log('   get   =>  ', row); // res.json(row); // [{}]

          res.json({
            success: !!row.length > 0,
            msg: '募資資料查詢成功',
            data: row
          });

        case 10:
        case "end":
          return _context5.stop();
      }
    }
  });
}); // 系列

router.get("/series", function _callee4(req, res) {
  var series, sql, _ref13, _ref14, totalRows;

  return regeneratorRuntime.async(function _callee4$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          if (!req.query.category) {
            _context6.next = 12;
            break;
          }

          series = req.query.category;
          sql = "SELECT * FROM e_fund_project WHERE e_cate = " + series;
          console.log('sql: ' + sql);
          console.log('series' + series);
          console.log('req.query' + req.query);
          _context6.next = 8;
          return regeneratorRuntime.awrap(db.query(sql));

        case 8:
          _ref13 = _context6.sent;
          _ref14 = _slicedToArray(_ref13, 1);
          totalRows = _ref14[0];
          res.json(totalRows);

        case 12:
        case "end":
          return _context6.stop();
      }
    }
  });
}); // 專案新舊

router.get("/project_time", function _callee5(req, res) {
  var time, sql, _ref15, _ref16, totalRows;

  return regeneratorRuntime.async(function _callee5$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          if (!req.query.time) {
            _context7.next = 12;
            break;
          }

          time = req.query.time;
          sql = "SELECT * FROM e_fund_project WHERE project_cate = " + time;
          console.log('sql: ' + sql);
          console.log('time' + time);
          console.log('req.query' + req.query);
          _context7.next = 8;
          return regeneratorRuntime.awrap(db.query(sql));

        case 8:
          _ref15 = _context7.sent;
          _ref16 = _slicedToArray(_ref15, 1);
          totalRows = _ref16[0];
          res.json(totalRows);

        case 12:
        case "end":
          return _context7.stop();
      }
    }
  });
}); //價錢由低到高
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

router.get("/project_price_asc", function _callee6(req, res) {
  var sql, _ref17, _ref18, totalRows;

  return regeneratorRuntime.async(function _callee6$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          sql = "SELECT * FROM e_fund_project ORDER BY e_fund_project.e_lowprice ASC";
          _context8.next = 3;
          return regeneratorRuntime.awrap(db.query(sql));

        case 3:
          _ref17 = _context8.sent;
          _ref18 = _slicedToArray(_ref17, 1);
          totalRows = _ref18[0];
          res.json(totalRows); // const [row] = await db.query(sql, [req.params.sid]);
          // res.json(row); // [{}]

        case 7:
        case "end":
          return _context8.stop();
      }
    }
  });
}); //價錢由高到低
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

router.get("/project_price_desc", function _callee7(req, res) {
  var sql, _ref19, _ref20, totalRows;

  return regeneratorRuntime.async(function _callee7$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          sql = "SELECT * FROM e_fund_project ORDER BY e_fund_project.e_lowprice DESC";
          _context9.next = 3;
          return regeneratorRuntime.awrap(db.query(sql));

        case 3:
          _ref19 = _context9.sent;
          _ref20 = _slicedToArray(_ref19, 1);
          totalRows = _ref20[0];
          res.json(totalRows); // const [row] = await db.query(sql, [req.params.sid]);
          // res.json(row); // [{}]

        case 7:
        case "end":
          return _context9.stop();
      }
    }
  });
}); //react
// router.get("/fundlistnew", async (req, res) => {
//   let sql = `SELECT * FROM e_fund_project ORDER BY project_cate ASC`;
//   const [results] = await db.query(sql);
//   res.json(results);
// });
// funditem

router.get("/reactitem/:sid", function _callee8(req, res) {
  var sql, _ref21, _ref22, row;

  return regeneratorRuntime.async(function _callee8$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          sql = "SELECT * FROM e_fund_project WHERE sid=?";
          _context10.next = 3;
          return regeneratorRuntime.awrap(db.query(sql, [req.params.sid]));

        case 3:
          _ref21 = _context10.sent;
          _ref22 = _slicedToArray(_ref21, 1);
          row = _ref22[0];
          res.json(row); // [{}]

        case 7:
        case "end":
          return _context10.stop();
      }
    }
  });
}); // get 追蹤狀態

router.get("/heart/:sid", function _callee9(req, res) {
  var sql, _ref23, _ref24, row;

  return regeneratorRuntime.async(function _callee9$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          sql = "SELECT * FROM `e_follow` WHERE follow_project=?";
          _context11.next = 3;
          return regeneratorRuntime.awrap(db.query(sql, [req.params.sid]));

        case 3:
          _ref23 = _context11.sent;
          _ref24 = _slicedToArray(_ref23, 1);
          row = _ref24[0];
          res.json(row); // [{}]

        case 7:
        case "end":
          return _context11.stop();
      }
    }
  });
}); // 加入追蹤 API

router.post('/addheart', upload.none(), function _callee10(req, res) {
  var data, sql, _ref25, _ref26, _ref26$, affectedRows, insertId;

  return regeneratorRuntime.async(function _callee10$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          data = _objectSpread({}, req.body);
          data.follow_time = moment(new Date()).format("YYYY-MM-DD");
          sql = "INSERT INTO `e_follow` set ?";
          _context12.next = 5;
          return regeneratorRuntime.awrap(db.query(sql, [data]));

        case 5:
          _ref25 = _context12.sent;
          _ref26 = _slicedToArray(_ref25, 1);
          _ref26$ = _ref26[0];
          affectedRows = _ref26$.affectedRows;
          insertId = _ref26$.insertId;
          // sql是語法一個問號即可，data是array
          // [{"fieldCount":0,"affectedRows":1,"insertId":860,"info":"","serverStatus":2,"warningStatus":1},null]
          res.json({
            success: !!affectedRows,
            affectedRows: affectedRows,
            insertId: insertId
          });

        case 11:
        case "end":
          return _context12.stop();
      }
    }
  });
}); // 刪除追蹤 API

router["delete"]("/del/:sid", function _callee11(req, res) {
  var sql, _ref27, _ref28, results;

  return regeneratorRuntime.async(function _callee11$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          sql = "DELETE FROM `e_follow` WHERE follow_project=?";
          _context13.next = 3;
          return regeneratorRuntime.awrap(db.query(sql, [req.params.sid]));

        case 3:
          _ref27 = _context13.sent;
          _ref28 = _slicedToArray(_ref27, 1);
          results = _ref28[0];
          res.json(results);

        case 7:
        case "end":
          return _context13.stop();
      }
    }
  });
}); // 編輯頁面

router.get("/edit/:sid", function _callee12(req, res) {
  var output;
  return regeneratorRuntime.async(function _callee12$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          _context14.next = 2;
          return regeneratorRuntime.awrap(getEditList(req));

        case 2:
          output = _context14.sent;
          res.render("man_fund/edit", output);

        case 4:
        case "end":
          return _context14.stop();
      }
    }
  });
}); // 新增頁面

router.get("/add", function _callee13(req, res) {
  var output, sql_cates, _ref29, _ref30;

  return regeneratorRuntime.async(function _callee13$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          output = {
            cates: []
          };
          sql_cates = "SELECT * FROM e_fund_categories";
          _context15.next = 4;
          return regeneratorRuntime.awrap(db.query(sql_cates));

        case 4:
          _ref29 = _context15.sent;
          _ref30 = _slicedToArray(_ref29, 1);
          output.cates = _ref30[0];
          res.render("man_fund/add", output);

        case 8:
        case "end":
          return _context15.stop();
      }
    }
  });
}); // ------------------------- 以下為 RESTful API------------------------------
// 編輯表單 API

router.post('/edit/:sid', upload.none(), function _callee14(req, res) {
  var data, sql, _ref31, _ref32, _ref32$, affectedRows, changedRows;

  return regeneratorRuntime.async(function _callee14$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          data = _objectSpread({}, req.body);
          data.last_edit_time = moment(new Date()).format("YYYY-MM-DD");
          sql = "UPDATE `e_fund_project` SET ? WHERE `sid`=?";
          _context16.next = 5;
          return regeneratorRuntime.awrap(db.query(sql, [data, req.params.sid]));

        case 5:
          _ref31 = _context16.sent;
          _ref32 = _slicedToArray(_ref31, 1);
          _ref32$ = _ref32[0];
          affectedRows = _ref32$.affectedRows;
          changedRows = _ref32$.changedRows;
          //  {"fieldCount":0,"affectedRows":1,"insertId":0,"info":"Rows matched: 1  Changed: 0  Warnings: 0","serverStatus":2,"warningStatus":0,"changedRows":0}
          res.json({
            success: !!changedRows,
            affectedRows: affectedRows,
            changedRows: changedRows
          });

        case 11:
        case "end":
          return _context16.stop();
      }
    }
  });
}); // 單張圖片上傳 API

router.post("/try-upload", upload.single('myfile'), function (req, res) {
  console.log('req.file' + req.file);

  if (req.file && req.file.originalname) {
    var ext = "";

    switch (req.file.mimetype) {
      case "image/png":
      case "image/jpeg":
      case "image/gif":
        fs.rename(req.file.path, __dirname + "/../public/img/" + req.file.originalname, function (error) {
          return res.json({
            success: true,
            path: "/img/" + req.file.originalname,
            newFileName: req.file.filename
          });
        });
        break;

      default:
        fs.unlink(req.file.path, function (error) {
          return res.json({
            success: false,
            msg: "不是圖檔"
          });
        });
    }
  } else {
    return res.json({
      success: false,
      msg: "沒有上傳檔案"
    });
  }
}); // 新增表單 API

router.post('/add', upload.none(), function _callee15(req, res) {
  var data, sql, _ref33, _ref34, _ref34$, affectedRows, insertId;

  return regeneratorRuntime.async(function _callee15$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          data = _objectSpread({}, req.body);
          sql = "INSERT INTO `e_fund_project` set ?";
          console.log(JSON.stringify(data));
          _context17.next = 5;
          return regeneratorRuntime.awrap(db.query(sql, [data]));

        case 5:
          _ref33 = _context17.sent;
          _ref34 = _slicedToArray(_ref33, 1);
          _ref34$ = _ref34[0];
          affectedRows = _ref34$.affectedRows;
          insertId = _ref34$.insertId;
          res.json({
            success: !!affectedRows,
            affectedRows: affectedRows,
            insertId: insertId
          });

        case 11:
        case "end":
          return _context17.stop();
      }
    }
  });
}); // 資料刪除 API

router["delete"]("/del/:sid", function _callee16(req, res) {
  var sql, _ref35, _ref36, results;

  return regeneratorRuntime.async(function _callee16$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          sql = "DELETE FROM `e_fund_project` WHERE sid=?";
          _context18.next = 3;
          return regeneratorRuntime.awrap(db.query(sql, [req.params.sid]));

        case 3:
          _ref35 = _context18.sent;
          _ref36 = _slicedToArray(_ref35, 1);
          results = _ref36[0];
          res.json(results);

        case 7:
        case "end":
          return _context18.stop();
      }
    }
  });
}); // -------------------------------- 以下匯出模組------------------------------
// 記得加這句呀～module匯出index才能用呀～

module.exports = router;