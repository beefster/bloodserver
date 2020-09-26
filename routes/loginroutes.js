var mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});
connection.connect(function(err){
    if(!err){
        console.log('Database connected');
    } else {
        console.log ('Database connection error');
    }
});

exports.register = async function(req, res){
    const password = req.body.password;
    const encryptedPassword = await bcrypt.hash(password, saltRounds);

    var users={
        'email':req.body.email,
        'password':encryptedPassword
    }
    connection.query('INSERT INTO users SET ?', users, function (error, results, fields){
        if (error){
            res.send({
                'code':400,
                'failed':'registration INSERT query error',
            })
        } else {
            res.send({
                'code':200,
                'success':'registration success'
            });
        }
    });
}

exports.login = async function(req, res){
    var email = req.body.email;
    var password = req.body.password;
    connection.query('SELECT * FROM users WHERE email = ?', [email], async function (error, results, fields){
        if (error) {
            res.send({
                "code":400,
                "failed":"login query error"
              });
        } else if(results.length > 0){
            const passwordMatch = await bcrypt.compare(password, results[0].password);
            if(passwordMatch){
                res.send({
                    'code':200,
                    'success':'login success'
                });
            } else {
                res.send({
                    'code':204,
                    'success':'incorrect password'
                });
            }
        } else {
            res.send({
                'code':206,
                'success':'email not found'
            });
        }
        
    })
}