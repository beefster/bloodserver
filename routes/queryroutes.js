const pool = require('../db').pool;
exports.list = async function(req, res){
    pool.query('SELECT * FROM UserRecords', async function(error, results, fields){
        res.send(results);
    });
}
exports.search = async function(req, res){
    query = `SELECT * FROM UserRecords WHERE city = ${req.body.City} AND state = ${req.body.State} AND country = ${req.body.Country}`;
    if(req.body.Blood_type != '') query += ` AND bloodType = ${req.body.Blood_type}`;
    pool.query(query, async function(error, results, fields){
        res.send(results);
    })

}