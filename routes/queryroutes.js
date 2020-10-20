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