var mysql = require('mysql');
const argon2 = require('argon2');
var secureRandom = require('secure-random');

var connection = mysql.createConnection({

    //set these parameters in a .env file

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
    console.log('request received', req);
    try{
        const passwordHash = await argon2.hash(req.body.Password);
        var user={
            'email':req.body.Email,
            'passwordHash':passwordHash,
            'salt':''
        }
        connection.query('INSERT INTO Users SET ?', user, function (error, results, fields){
            if (error){
                console.log('user insert error:\n'+error)
                res.send({
                    'code':400,
                    'queryerror':error
                })
            } else {
                connection.query(`SELECT UserID FROM Users WHERE email = '${req.body.Email}'`,
                (error, results, fields) => {
                        if (error) {
                            console.log('id select error');
                            res.send({
                                'code': 400,
                                'queryerror': error
                            });
                        } else {
                            userId = results[0]['UserID'];

                                var record ={
                                    firstName:  req.body.First_name,
                                    lastName:   req.body.Last_name,
                                    address:    req.body.Address,
                                    city:       req.body.City,
                                    state:      req.body.State,
                                    zipCode:    req.body.Zip_code,
                                    country:    req.body.Country,
                                    bloodType:  req.body.Blood_type,
                                    userName:   req.body.User_name,
                                }
                                connection.query('INSERT INTO userRecords SET ?', record,
                                function(error, results, fields){
                                    if(error){
                                        res.send({
                                            'code':400,
                                            'failed':error,
                                        })
                                    }
                                })
                                res.send({
                                    'code':200,
                                    'success':'registration success'
                                });
                            
                        }
                    })
                
            }
        });
    } catch(err){
        console.log('hash failure', err);
    }
}

exports.login = async function(req, res){
    const email = req.body.email;
    const password = await argon.hash(req.body.password);
    console.log(`login attempt\nuser:${email}\npassword:${password}`);
    connection.query('SELECT * FROM Users WHERE email = ?', [email], async function (error, results, fields){
        if (error) {
            res.send({
                "code":400,
                "queryerror":error
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