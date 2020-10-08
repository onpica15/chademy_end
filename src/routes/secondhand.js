const express = require('express');
const router = express.Router();
const db = require(__dirname + "/../db_connect2");



router.get('/list', (req, res) => {
    res.send('中古產品列表頁');
});

router.get('/item/:sid', (req, res) => {
    res.send('中古產品頁' + req.url);
});

router.get('/upload', (req, res) => {
    res.send('中古商品上架頁');
})


// 記得加這句呀～module匯出index才能用呀～
module.exports = router;