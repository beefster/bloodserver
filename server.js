require('dotenv').config();

const express = require('express');
var login = require('./routes/loginroutes');;
var query = require('./routes/queryroutes')
const bodyParser = require('body-parser');
const pool = require('./db').pool;
const jwt = require('jsonwebtoken');

pool.getConnection((err, testconn) => {
    if(err) console.error('database connection error');
    else{
        console.log('database connected');
        testconn.query('SELECT COUNT(*) AS recordcount FROM Users;', (err, result, fields) => {
            if(err) console.error('record count query error');
            else console.log(`${result[0]['recordcount']} records in Users`);
        });
        testconn.query('SELECT COUNT(*) AS recordcount FROM UserRecords;', (err, result, fields) => {
            if(err) console.error('record count query error');
            else console.log(`${result[0]['recordcount']} records in UserRecords`);
        });
    }
})

const verifyToken = () => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null)  res.send({
            'code':401,
            'error':'no authorization token'
        })

        jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
            if(err){
                console.log(err);
                res.send({
                    'code':403,
                    'error':'error verifying token'
                })
            } else{
                req.id = data.ID;
                next();
            }
        })
    }
}

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var router = express.Router();

router.post('/register', login.register);
router.post('/login', login.login);
router.post('/search', query.search);
router.post('/stats', query.stats);
router.post('/createRequest', verifyToken(), query.createRequest);
router.get('/getRequests', verifyToken(), query.getRequests);
router.post('/updateProfile', verifyToken(), query.updateProfile);
app.use('/api', router);
app.listen(907, () => console.log('Server running.'));