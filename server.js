require('dotenv').config()

const express = require('express');
var login = require('./routes/loginroutes')
//var query = require('./routes/queryroutes')
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var router = express.Router();

router.post('/register',login.register);
router.post('/login',login.login);
router.get('/search', login.search);
app.use('/api', router);
app.listen(907, () => console.log('Server running.'));