const argon2 = require('argon2');
const pool = require('../db').pool;

exports.register = async function(req, res){
    try{
        pool.getConnection(async function(err, connection){
            if(err) throw err;
            const passwordHash = await argon2.hash(req.body.Password);
            var user={
                'email':req.body.Email,
                'passwordHash':passwordHash,
            }
            connection.query('START TRANSACTION');
            connection.query('INSERT INTO Users SET ?', user, function (error, results, fields){
                if (error){
                    console.log('user insert error:\n'+error)
                    res.send({
                        'code':400,
                        'queryerror':error
                    })
                    return
                } else {
                    connection.query(`SELECT UserID FROM Users WHERE email = '${req.body.Email}'`,
                    (error, results, fields) => {
                            if (error) {
                                console.log('id select error');
                                res.send({
                                    'code': 400,
                                    'queryerror': error
                                });
                                connection.query('ROLLBACK');
                                return
                            } else {
                                var userId = results[0]['UserID'];
                                var record ={
                                    UserID:     userId,
                                    firstName:  req.body.First_name,
                                    lastName:   req.body.Last_name,
                                    email:      req.body.Email,
                                    address:    req.body.Address,
                                    city:       req.body.City,
                                    state:      req.body.State,
                                    zip:        req.body.Zip_code,
                                    country:    req.body.Country,
                                    userType:   req.body.User_type,
                                    bloodType:  req.body.Blood_type,
                                    userName:   req.body.User_name,
                                }
                                connection.query('INSERT INTO UserRecords SET ?', record,
                                function(error, results, fields){
                                    if(error){
                                        console.error('record insert error: ',error)
                                        res.send({
                                            'code':400,
                                            'failed':error,
                                        })
                                        connection.query('ROLLBACK');
                                        return
                                    }
                                    connection.query('COMMIT');
                                    res.send({
                                        'code':200,
                                        'success':'registration success'
                                    });
                                })

                            }
                        })
                    
                }
            });
        })
    } catch(err){
        console.error(err);
    }
}

exports.login = async function(req, res){
    const email = req.body.email;
    //console.log(`login attempt\nuser:${email}\ngave password:${req.body.password}`);
    pool.query('SELECT * FROM Users WHERE email = ?', [email], async function (error, results, fields){
        if (error) {
            res.send({
                "code":400,
                "queryerror":error
              });
        } else if(results.length == 1){
            if(await argon2.verify(results[0].passwordHash, req.body.password)){
                console.log('login success\n================');
                res.send({
                    'code':200,
                    'success':'login success'
                });
            } else {
                console.log('login failed\n================');
                res.send({
                    'code':204,
                    'success':'incorrect password'
                });
            }
        } else if(results.length > 1){
            res.send({
                'code':204,
                'success':'duplicate emails'
            });
        } else {
            res.send({
                'code':206,
                'success':'email not found'
            });
        }
        
    })
}