const pool = require('../db').pool;
exports.list = async function(req, res){
    pool.query('SELECT * FROM UserRecords', async function(error, results, fields){
        res.send({
            'code': 200,
            'records': results
        });
    });
}
exports.search = async function(req, res){
    console.log('search request');
    console.log(req.body);
    query = `SELECT * FROM UserRecords WHERE city = '${req.body.City}' AND state = '${req.body.State}' AND country = '${req.body.Country}'`;
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
    console.log('stats request:');
    console.log(req.body);
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
// exports.createRequest = async function(req, res){
//     query
// }