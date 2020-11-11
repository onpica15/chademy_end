const express = require('express')
const moment = require('moment-timezone')
const jwt = require('jsonwebtoken')
const db = require(__dirname + '/../db_connect2')
const router = express.Router()
const http = require("http");
const socketIo = require("socket.io");

const app = express();
// app.use(index3);

const server = http.createServer(app);

const io = socketIo(server);
io.on("connection", (socket) => {
    console.log("New client connected");

    router.get('/record/new', async (req, res)=>{
        const sql ='SELECT * FROM record ORDER BY sid DESC'
        const [row] = await db.query(sql)
        res.json(row[0].total_price)
    })
    

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      
    });
  });
 
  const fm2 = 'YYYY/MM/DD HH:mm:ss';
  const startdate = '2020/11/01';
  const enddate = '2020/11/04'
  function getTimeRemaining(startdate,enddate){ 
    const s_time = new Date(startdate).getTime();
    const e_time = new Date(enddate).getTime();
    const total = e_time - s_time
    // const seconds = Math.floor( (total/1000) % 60 ); 
    // const minutes = Math.floor( (total/1000/60) % 60 ); 
    // const hours = Math.floor( (total/(1000*60*60)) % 24 ); 
    // const days = Math.floor( total/(1000*60*60*24) ); 
    // return { total, days, hours, minutes, seconds }; 
    return total
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// router.put('/bidchange', async( req,res)=>{
//     const sql ='UPDATE `bidding` SET `countdown`=? WHERE sid=?'
//     const [row] = await db.query(sql,[req.body.countdown,req.body.sid])
//     for(let i=1;i<27;i++){
//         const mm = getTimeRemaining(row[i].startingDate,row[i].bidDate)
//     console.log(mm)
//             row[i].countdown = mm
//         }

//             res.json(row);
// })
router.get('/list/:sid?', async (req, res)=>{
    const sql ='SELECT * FROM bidding WHERE sid=?'
    const [row] = await db.query(sql,[req.params.sid])
    const fm = 'YYYY/MM/DD HH:mm:ss';
    // const newprice = numberWithCommas(row[0].startedPrice)
    row[0].startingDate = moment(row[0].startingDate).format(fm)
    row[0].bidDate = moment(row[0].bidDate).format(fm)
    // row[0].startedPrice = numberWithCommas(row[0].startedPrice)
    // row[0].current_price = numberWithCommas(row[0].current_price)
    
            res.json(row);
    
});
router.get('/bid/:sid?', async (req, res)=>{
    const sql ='SELECT p.*, b.* FROM `products` p JOIN `bidding` b ON p.`product_sid`=b.`product_sid` WHERE p.product_sid =?'
    const [row] = await db.query(sql,[req.params.sid])
    const fm = 'YYYY/MM/DD HH:mm:ss';
    const fmmm = 'YYYY/MM/DD';
   
        row[0].startingDate = moment(row[0].startingDate).format(fm)
        row[0].bidDate = moment(row[0].bidDate).format(fm)
        row[0].sdate = moment(row[0].sdate).format(fmmm)
        row[0].edate = moment(row[0].edate).format(fmmm)
        row[0].pic = row[0].pic.split(',')
        // row[0].startedPrice = numberWithCommas(row[0].startedPrice)
        // row[0].current_price = numberWithCommas(row[0].current_price)
        
        res.json(row)
    // if(row && row.length){
    //     row[0].bidDate = moment(row[0].bidDate).format(fm),
    //     res.json(row[0]);

    // } else {
    //     res.json({});
    // }
});

// router.get('/record/new', async (req, res)=>{
//     const sql ='SELECT * FROM record ORDER BY sid DESC'
//     const [row] = await db.query(sql)
//     res.json(row[0].total_price)
// });
router.get('/record/list', async (req, res)=>{
    // const sql ='SELECT p.*, r.* FROM `products` p JOIN `record` r ON p.`product_sid`=r.`sid` WHERE r.sid=?'
    const sql ='SELECT p.*, r.*,b.* FROM `products` p INNER JOIN `record` r ON p.`sid`=r.`sid` INNER JOIN `bidding` b ON r.`sid`=b.`sid`'
    const [row] = await db.query(sql)
    const fm = 'YYYY/MM/DD HH:mm:ss';
    const fmmm = 'YYYY/MM/DD';

    const newdate = null
    // console.log(row.length)
    // if(row && row.length){
        for(let i=0;i<row.length;i++){
            row[i].startingDate = moment(row[i].startingDate).format(fm)
            row[i].bidDate = moment(row[i].bidDate).format(fm)
            row[i].sdate = moment(row[i].sdate).format(fmmm)
            row[i].edate = moment(row[i].edate).format(fmmm)
            row[i].pic = row[i].pic.split(',')
            // row[i].startedPrice = numberWithCommas(row[i].startedPrice)
            // row[i].current_price = numberWithCommas(row[i].current_price)

        }
        
        res.json(row)

    // } else {
    //     res.json({});
    // }
    
});

router.get('/member-record', async (req, res)=>{
    const sql ='SELECT m.* ,r.* FROM `members` m JOIN `record` r ON r.`sid`=m.`record_sid` LIMIT 15'
    const [row] = await db.query(sql)
    const fm = 'YYYY/MM/DD HH:mm:ss';

    for(let i=0;i<row.length;i++){
        row[i].time = moment(row[i].time).format(fm)
        row[i].price = numberWithCommas(row[i].price)
        row[i].total_price = numberWithCommas(row[i].total_price)

    }
        res.json(row)
    })


router.post('/record', async (req, res)=>{
    const sql ='INSERT INTO `record` (`product_sid`,`member_sid`,`bid_sid`,`price`, `total_price`) VALUES (?,?,?,?,?);'
    // req.body: product_sid, member_sid, bid_sid, price, total_price
    const [r] = await db.query(sql,[req.body.product_sid, req.body.member_sid, req.body.bid_sid, req.body.price, req.body.total_price])

    const sql2 = 'UPDATE `bidding` SET `current_price`=? WHERE `sid`=?'
    const [r1] = await db.query(sql2,[req.body.total_price, req.body.sid])

    res.json({
        result: r,
        body: req.body,
    });
});

router.get('/designer/:sid?', async (req, res)=>{
    // const sql ='SELECT * FROM designers WHERE sid=?'
    const sql =`SELECT d.\`intro\`,d.\`designer_pic\`,d.\`name\`, p.* FROM \`designers\` d JOIN \`products\` p ON p.\`designer_sid\`=d.\`designer_sid\` WHERE p.sid=?`

    // console.log(sql);
    const [row] = await db.query(sql,[req.params.sid])
    // console.log(row);
    res.json(row[0]);
});


module.exports = router;

