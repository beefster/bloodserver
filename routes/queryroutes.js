const pool = require('../db').pool;
const argon2 = require('argon2');

exports.updatePassword = async function(req, res, next){
    
    if(!req.body.passChange) next()
    else{
        pool.query(`SELECT passwordHash FROM Users WHERE UserID = ${req.id}`, async function(error, results, fields){
        if(await argon2.verify(results[0].passwordHash, req.body.passChange.old)){
            const newPasswordHash = await argon2.hash(req.body.passChange.new);
            pool.query(`UPDATE Users SET passwordHash = '${newPasswordHash}' WHERE UserID = ${req.id}`,
            function(error, results, fields){
                if(error){
                    res.send({
                        'code':400,
                        'error':error
                    })
                } else {
                    req.passChanged = true
                    next()
                }
            });
        } else {
            res.send({
                'code':204,
                'error':'current password was incorrect'
            });
        }
    })
    }
}

exports.updateProfile = async function(req, res){
    if(!(JSON.stringify(req.body.profileChange) === JSON.stringify({}))){
        pool.query(`UPDATE UserRecords SET ? WHERE UserID = ${req.id}`, req.body.profileChange, (error, results, fields) => {
        
            var msg = ''
            if(req.passChanged) msg = '\nPassword Changed!'
            if(error){
                res.send({
                    'code':400,
                    'error':'Profile update failed.'+msg
                })
                return
            } else {
                res.send({
                    'code': 200,
                    'success':'Profile updated!'+msg
                });
            }
        })
    } else if(req.passChanged) {
        res.send({
            'code': 200,
            'success':'Password Changed!'
        });
    }
}

exports.search = async function(req, res){
    console.log('search request');
    console.log(req.body);
    query = `SELECT * FROM UserRecords
    WHERE city = '${req.body.City}'
    AND state = '${req.body.State}'
    AND country = '${req.body.Country}'`;
    //console.log(query);
    if(req.body.Blood_type != '') query += ` AND bloodType = "${req.body.Blood_type}"`;
    pool.query(query, async function(error, results, fields){
        if(error){
            console.error(error);
            res.send({
                'code': 501,
                'error': error
            })

        }else{
            res.send({
                'code': 200,
                'records': results
            });
        }
    })

}
exports.stats = async function(req, res){
    query = 'SELECT bloodType, COUNT(*) AS tally FROM UserRecords ';
    if(req.body.Country != '') query += `WHERE country = '${req.body.Country}'`;
    if(req.body.State != '') query += ` AND state = '${req.body.State}'`;
    if(req.body.City != '') query += ` AND city = '${req.body.City}'`;
    query += ' GROUP BY bloodType';
    console.log(query);
    stats = {
        'A+':0,
        'A-':0,
        'B+':0,
        'B-':0,
        'O+':0,
        'O-':0,
        'AB+':0,
        'AB-':0
    }
    pool.query(query, async function(error, results, fields){
        if(error){
            console.error(error);
            res.send({
                'code': 501,
                'error': error
            })

        }else{
            for (record in results){
                row = results[record];
                stats[row['bloodType']] = row['tally']
            }
            console.log(stats);
            res.send({
                'code':200,
                'stats':stats
            })
        }
    })
}
exports.createRequest = async function(req, res){
    var record = {
        SenderID:req.id,
        RecipientID:req.body.Recipient,
        Accepted:0
    }
    pool.query('INSERT INTO Requests SET ?', record, (error) => {
        if(error){
            res.send({
                'code':400,
                'queryerror':error
            })
        } else {
            res.send({
                'code': 200,
                'success':'request made'
            })
        }
    })
}
exports.getRequests = async function(req,res){
    console.log('request GET')
    pool.query(`SELECT * FROM UserRecords LEFT JOIN Requests ON UserID = RecipientID
    WHERE SenderID = ${req.id}
    UNION
    SELECT * FROM UserRecords LEFT JOIN Requests ON UserID = SenderID
    WHERE RecipientID = ${req.id}`, (error, results, fields) => {
        if(error) res.status(400).send(error)
        else{
            sent = []
            approved = []
            received = []
            available = []
            for (record in results){
                row = results[record];
                if(row['SenderID'] == req.id){
                    if(row['approved']) approved.push(row)
                    else appr
                }
                else if(row['RecipientID'] == req.id) received.push(row)
            }
            res.send({
                'code': 200,
                'sentRequests':sent,
                'receivedRequests':received
            })
        }
    });
}