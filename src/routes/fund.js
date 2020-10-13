const express = require('express');
const router = express.Router();
const db = require(__dirname + "/../db_connect2");



router.get('/list', (req, res) => {
    res.send('募資專案首頁');
});


router.get('/list', (req, res) => {
    res.send('募資專案列表頁');
});

router.get('/item/:sid', (req, res) => {
    res.send('募資產品頁' + req.url);
});

router.get('/upload', (req, res) => {
    res.send('提案頁');
})


// 記得加這句呀～module匯出index才能用呀～
module.exports = router;