"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var express = require("express");

var router = express.Router();

var db = require(__dirname + "/../db_connect2");

var moment = require("moment-timezone");

var multer = require("multer");

var upload = require(__dirname + "/../upload-img-module");

var fs = require("fs"); //MVC
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
          return regeneratorRuntime.awrap(db.query("SELECT COUNT(1) totalRows FROM i_secondhand_product"));

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

          sql = "SELECT * FROM i_secondhand_product LIMIT ".concat((output.page - 1) * output.perPage, ", ").concat(output.perPage);
          _context.next = 16;
          return regeneratorRuntime.awrap(db.query(sql));

        case 16:
          _ref3 = _context.sent;
          _ref4 = _slicedToArray(_ref3, 1);
          results = _ref4[0];
          results.forEach(function (el) {
            el.last_edit_time = moment(el.last_edit_time).format("YYYY-MM-DD");
            el.on_shelf_time = moment(el.on_shelf_time).format("YYYY-MM-DD");
            el.off_shelf_time = moment(el.off_shelf_time).format("YYYY-MM-DD");
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

; // 畫面

router.get("/list", function _callee(req, res) {
  var output, sql, _ref5, _ref6, results;

  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          output = {
            rows: []
          };
          sql = "SELECT * FROM i_secondhand_product ORDER BY sid  LIMIT 10";
          _context2.next = 4;
          return regeneratorRuntime.awrap(db.query(sql));

        case 4:
          _ref5 = _context2.sent;
          _ref6 = _slicedToArray(_ref5, 1);
          results = _ref6[0];
          output.rows = results; //   results.forEach((el) => {
          //     el.last_edit_time = moment(el.last_edit_time).format("YYYY-MM-DD");
          //     el.on_shelf_time = moment(el.on_shelf_time).format("YYYY-MM-DD");
          //     el.off_shelf_time = moment(el.off_shelf_time).format("YYYY-MM-DD");
          //   });

          res.render("man_secondhand/man_secondhand_list", output);

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  });
});
/**
 * get broduct by category id
 */

router.get("/list", function _callee2(req, res) {
  var output, sql, _ref7, _ref8, results;

  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          output = {
            rows: []
          };
          sql = "SELECT * FROM i_secondhand_product ORDER BY sid  LIMIT 10";
          _context3.next = 4;
          return regeneratorRuntime.awrap(db.query(sql));

        case 4:
          _ref7 = _context3.sent;
          _ref8 = _slicedToArray(_ref7, 1);
          results = _ref8[0];
          output.rows = results; //   results.forEach((el) => {
          //     el.last_edit_time = moment(el.last_edit_time).format("YYYY-MM-DD");
          //     el.on_shelf_time = moment(el.on_shelf_time).format("YYYY-MM-DD");
          //     el.off_shelf_time = moment(el.off_shelf_time).format("YYYY-MM-DD");
          //   });

          res.render("man_secondhand/man_secondhand_list", output);

        case 9:
        case "end":
          return _context3.stop();
      }
    }
  });
}); //react

router.get("/secondhandlist", function _callee3(req, res) {
  var sql, _ref9, _ref10, results;

  return regeneratorRuntime.async(function _callee3$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          sql = "SELECT * FROM i_secondhand_product ORDER BY sid DESC";
          _context4.next = 3;
          return regeneratorRuntime.awrap(db.query(sql));

        case 3:
          _ref9 = _context4.sent;
          _ref10 = _slicedToArray(_ref9, 1);
          results = _ref10[0];
          res.json(results);

        case 7:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // 產品頁面

router.get("/secondhandlist/:sid", function _callee4(req, res) {
  var sql, _ref11, _ref12, row;

  return regeneratorRuntime.async(function _callee4$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          sql = "SELECT * FROM i_secondhand_product WHERE sid=?";
          _context5.next = 3;
          return regeneratorRuntime.awrap(db.query(sql, [req.params.sid]));

        case 3:
          _ref11 = _context5.sent;
          _ref12 = _slicedToArray(_ref11, 1);
          row = _ref12[0];
          res.json(row); // [{}]

        case 7:
        case "end":
          return _context5.stop();
      }
    }
  });
}); //猜你喜歡

router.get("/relate/:sid", function _callee5(req, res) {
  var sql, _ref13, _ref14, row;

  return regeneratorRuntime.async(function _callee5$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          sql = "SELECT * FROM i_secondhand_product WHERE categories_sid=?";
          _context6.next = 3;
          return regeneratorRuntime.awrap(db.query(sql, [req.params.sid]));

        case 3:
          _ref13 = _context6.sent;
          _ref14 = _slicedToArray(_ref13, 1);
          row = _ref14[0];
          res.json(row); // [{}]

        case 7:
        case "end":
          return _context6.stop();
      }
    }
  });
}); //review_member

router.post('/review_member', upload.none(), function _callee6(req, res) {
  var data, sql, _ref15, _ref16, _ref16$, affectedRows, insertId;

  return regeneratorRuntime.async(function _callee6$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          data = _objectSpread({}, req.body);
          data.review_time = moment(new Date()).format("YYYY-MM-DD");
          sql = "INSERT INTO `i_comment_c2c` set ?";
          console.log(JSON.stringify(data));
          _context7.next = 6;
          return regeneratorRuntime.awrap(db.query(sql, [data]));

        case 6:
          _ref15 = _context7.sent;
          _ref16 = _slicedToArray(_ref15, 1);
          _ref16$ = _ref16[0];
          affectedRows = _ref16$.affectedRows;
          insertId = _ref16$.insertId;
          // sql是語法一個問號即可，data是array
          // [{"fieldCount":0,"affectedRows":1,"insertId":860,"info":"","serverStatus":2,"warningStatus":1},null]
          res.json({
            success: !!affectedRows,
            affectedRows: affectedRows,
            insertId: insertId
          });

        case 12:
        case "end":
          return _context7.stop();
      }
    }
  });
}); //get memberRevirw

router.get("/member_star/:sid", function _callee7(req, res) {
  var sql, _ref17, _ref18, row;

  return regeneratorRuntime.async(function _callee7$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          sql = "SELECT * FROM i_comment_c2c WHERE seller_sid=?";
          _context8.next = 3;
          return regeneratorRuntime.awrap(db.query(sql, [req.params.sid]));

        case 3:
          _ref17 = _context8.sent;
          _ref18 = _slicedToArray(_ref17, 1);
          row = _ref18[0];
          res.json(row); // [{}]

        case 7:
        case "end":
          return _context8.stop();
      }
    }
  });
}); //get allMemberRevirw

router.get("/all_member_star/", function _callee8(req, res) {
  var sql, _ref19, _ref20, row;

  return regeneratorRuntime.async(function _callee8$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          sql = "SELECT * FROM i_comment_c2c";
          _context9.next = 3;
          return regeneratorRuntime.awrap(db.query(sql, [req.params.sid]));

        case 3:
          _ref19 = _context9.sent;
          _ref20 = _slicedToArray(_ref19, 1);
          row = _ref20[0];
          res.json(row); // [{}]

        case 7:
        case "end":
          return _context9.stop();
      }
    }
  });
}); //get member data

router.get("/member_data", function _callee9(req, res) {
  var sql, _ref21, _ref22, row;

  return regeneratorRuntime.async(function _callee9$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          sql = "SELECT * FROM `members`";
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
}); //myproduct

router.get("/myproduct/:sid", function _callee10(req, res) {
  var sql, _ref23, _ref24, row;

  return regeneratorRuntime.async(function _callee10$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          sql = "SELECT * FROM `i_secondhand_product` WHERE `member_sid` = ? ORDER BY `i_secondhand_product`.`sid` DESC  ";
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
});
router.get("/edit/:sid", function _callee11(req, res) {
  var output, sql_conditions, sql_categories, sql_material, sql_framework, sql, _ref25, _ref26, _ref27, _ref28, _ref29, _ref30, _ref31, _ref32, _ref33, _ref34, results;

  return regeneratorRuntime.async(function _callee11$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          output = {
            conditions: [],
            categories: [],
            material: [],
            framework: [],
            row: []
          };
          sql_conditions = "SELECT * FROM i_secondhand_conditions";
          sql_categories = "SELECT * FROM i_secondhand_categories";
          sql_material = "SELECT * FROM i_secondhand_material";
          sql_framework = "SELECT * FROM i_secondhand_framework";
          sql = "SELECT * FROM i_secondhand_product WHERE sid=?";
          _context12.next = 8;
          return regeneratorRuntime.awrap(db.query(sql_conditions));

        case 8:
          _ref25 = _context12.sent;
          _ref26 = _slicedToArray(_ref25, 1);
          output.conditions = _ref26[0];
          _context12.next = 13;
          return regeneratorRuntime.awrap(db.query(sql_categories));

        case 13:
          _ref27 = _context12.sent;
          _ref28 = _slicedToArray(_ref27, 1);
          output.categories = _ref28[0];
          _context12.next = 18;
          return regeneratorRuntime.awrap(db.query(sql_material));

        case 18:
          _ref29 = _context12.sent;
          _ref30 = _slicedToArray(_ref29, 1);
          output.material = _ref30[0];
          _context12.next = 23;
          return regeneratorRuntime.awrap(db.query(sql_framework));

        case 23:
          _ref31 = _context12.sent;
          _ref32 = _slicedToArray(_ref31, 1);
          output.framework = _ref32[0];
          _context12.next = 28;
          return regeneratorRuntime.awrap(db.query(sql, [req.params.sid]));

        case 28:
          _ref33 = _context12.sent;
          _ref34 = _slicedToArray(_ref33, 1);
          results = _ref34[0];
          output.row = results[0]; // length>0 則為true

          if (results.length) {
            _context12.next = 34;
            break;
          }

          return _context12.abrupt("return", res.redirect("/man_secondhand/list"));

        case 34:
          // res.send(results[0]);
          res.render("man_secondhand/man_secondhand_edit", output);

        case 35:
        case "end":
          return _context12.stop();
      }
    }
  });
});
router.get("/add", function _callee12(req, res) {
  var output, sql_conditions, sql_categories, sql_material, sql_framework, _ref35, _ref36, _ref37, _ref38, _ref39, _ref40, _ref41, _ref42;

  return regeneratorRuntime.async(function _callee12$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          output = {
            conditions: [],
            categories: [],
            material: [],
            framework: []
          };
          sql_conditions = "SELECT * FROM i_secondhand_conditions";
          sql_categories = "SELECT * FROM i_secondhand_categories";
          sql_material = "SELECT * FROM i_secondhand_material";
          sql_framework = "SELECT * FROM i_secondhand_framework";
          _context13.next = 7;
          return regeneratorRuntime.awrap(db.query(sql_conditions));

        case 7:
          _ref35 = _context13.sent;
          _ref36 = _slicedToArray(_ref35, 1);
          output.conditions = _ref36[0];
          _context13.next = 12;
          return regeneratorRuntime.awrap(db.query(sql_categories));

        case 12:
          _ref37 = _context13.sent;
          _ref38 = _slicedToArray(_ref37, 1);
          output.categories = _ref38[0];
          _context13.next = 17;
          return regeneratorRuntime.awrap(db.query(sql_material));

        case 17:
          _ref39 = _context13.sent;
          _ref40 = _slicedToArray(_ref39, 1);
          output.material = _ref40[0];
          _context13.next = 22;
          return regeneratorRuntime.awrap(db.query(sql_framework));

        case 22:
          _ref41 = _context13.sent;
          _ref42 = _slicedToArray(_ref41, 1);
          output.framework = _ref42[0];
          // output.cates = results;
          // res.json(output.cates);
          res.render("man_secondhand/man_secondhand_add", output);

        case 26:
        case "end":
          return _context13.stop();
      }
    }
  });
}); // RESTful API

router.get('/product/category/:sid', function _callee13(req, res) {
  var baseSql, data;
  return regeneratorRuntime.async(function _callee13$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          baseSql = "SELECT * FROM i_secondhand_product where categories_sid = ".concat(req.params.sid);
          _context14.next = 3;
          return regeneratorRuntime.awrap(db.query(baseSql));

        case 3:
          data = _context14.sent;
          console.log(baseSql);
          res.json({
            data: data[0]
          });

        case 6:
        case "end":
          return _context14.stop();
      }
    }
  });
});

var getCondition = function getCondition(wheres) {
  if (wheres.length === 0) {
    return '';
  }

  return ' where ' + wheres.join(' and ');
};

router.post('/product/category', upload.none(), function _callee14(req, res) {
  var _req$body, condition_sid, category_sid, material_sid, framework_sid, _req$body$page_no, page_no, _req$body$limit, limit, baseSql, wheres, where, data;

  return regeneratorRuntime.async(function _callee14$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          _req$body = req.body, condition_sid = _req$body.condition_sid, category_sid = _req$body.category_sid, material_sid = _req$body.material_sid, framework_sid = _req$body.framework_sid, _req$body$page_no = _req$body.page_no, page_no = _req$body$page_no === void 0 ? 0 : _req$body$page_no, _req$body$limit = _req$body.limit, limit = _req$body$limit === void 0 ? 8 : _req$body$limit;
          baseSql = "SELECT * FROM i_secondhand_product ";
          wheres = [];

          if (condition_sid) {
            wheres.push("conditions_sid = ".concat(condition_sid));
          }

          if (category_sid) {
            wheres.push("categories_sid = ".concat(category_sid));
          }

          if (material_sid) {
            wheres.push("material_sid = ".concat(material_sid));
          }

          if (framework_sid) {
            wheres.push("framework_sid = ".concat(framework_sid));
          }

          where = getCondition(wheres);
          console.log(where);

          if (where) {
            baseSql += where;
          }

          baseSql += " limit ".concat(page_no * limit, ", ").concat(limit);
          console.log(baseSql);
          _context15.next = 14;
          return regeneratorRuntime.awrap(db.query(baseSql));

        case 14:
          data = _context15.sent;
          res.json({
            data: data[0]
          });

        case 16:
        case "end":
          return _context15.stop();
      }
    }
  });
});
var typeMap = {
  condition: "conditions_sid",
  category: "categories_sid",
  material: "material_sid",
  framework: "framework_sid"
};
router.post('/product', function _callee15(req, res) {
  var _req$body2, type, sid, _req$body2$page_no, page_no, _req$body2$limit, limit, columnName, query, baseSql, data;

  return regeneratorRuntime.async(function _callee15$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          _req$body2 = req.body, type = _req$body2.type, sid = _req$body2.sid, _req$body2$page_no = _req$body2.page_no, page_no = _req$body2$page_no === void 0 ? 0 : _req$body2$page_no, _req$body2$limit = _req$body2.limit, limit = _req$body2$limit === void 0 ? 8 : _req$body2$limit;
          columnName = typeMap[type];
          query = columnName && sid ? " where ".concat(columnName, " = ").concat(sid) : '';
          baseSql = "SELECT * FROM i_secondhand_product ".concat(query, "\n  limit ").concat(page_no * limit, ", ").concat(limit);
          _context16.next = 6;
          return regeneratorRuntime.awrap(db.query(baseSql));

        case 6:
          data = _context16.sent;
          res.json({
            data: data[0]
          });

        case 8:
        case "end":
          return _context16.stop();
      }
    }
  });
});
router.post('/add', upload.none(), function _callee16(req, res) {
  var data, sql, _ref43, _ref44, _ref44$, affectedRows, insertId;

  return regeneratorRuntime.async(function _callee16$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          data = _objectSpread({}, req.body);
          sql = "INSERT INTO `i_secondhand_product` set ?";
          console.log(JSON.stringify(data));
          _context17.next = 5;
          return regeneratorRuntime.awrap(db.query(sql, [data]));

        case 5:
          _ref43 = _context17.sent;
          _ref44 = _slicedToArray(_ref43, 1);
          _ref44$ = _ref44[0];
          affectedRows = _ref44$.affectedRows;
          insertId = _ref44$.insertId;
          // sql是語法一個問號即可，data是array
          // [{"fieldCount":0,"affectedRows":1,"insertId":860,"info":"","serverStatus":2,"warningStatus":1},null]
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
});
router.post('/edit/:sid', upload.none(), function _callee17(req, res) {
  var data, sql, _ref45, _ref46, _ref46$, affectedRows, changedRows;

  return regeneratorRuntime.async(function _callee17$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          data = _objectSpread({}, req.body);
          sql = "UPDATE `i_secondhand_product` SET ? WHERE `sid`=?";
          _context18.next = 4;
          return regeneratorRuntime.awrap(db.query(sql, [data, req.params.sid]));

        case 4:
          _ref45 = _context18.sent;
          _ref46 = _slicedToArray(_ref45, 1);
          _ref46$ = _ref46[0];
          affectedRows = _ref46$.affectedRows;
          changedRows = _ref46$.changedRows;
          //  {"fieldCount":0,"affectedRows":1,"insertId":0,"info":"Rows matched: 1  Changed: 0  Warnings: 0","serverStatus":2,"warningStatus":0,"changedRows":0}
          res.json({
            success: !!changedRows,
            affectedRows: affectedRows,
            changedRows: changedRows
          });

        case 10:
        case "end":
          return _context18.stop();
      }
    }
  });
});
router["delete"]("/del/:sid", function _callee18(req, res) {
  var sql, _ref47, _ref48, results;

  return regeneratorRuntime.async(function _callee18$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          sql = "DELETE FROM `i_secondhand_product` WHERE sid=?";
          _context19.next = 3;
          return regeneratorRuntime.awrap(db.query(sql, [req.params.sid]));

        case 3:
          _ref47 = _context19.sent;
          _ref48 = _slicedToArray(_ref47, 1);
          results = _ref48[0];
          res.json(results);

        case 7:
        case "end":
          return _context19.stop();
      }
    }
  });
}); // 記得加這句呀～module匯出index才能用呀～

module.exports = router;