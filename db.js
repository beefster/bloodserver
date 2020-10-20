var mysql = require('mysql');

const pool = mysql.createPool({

    //set these parameters in a .env file

    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

exports.pool = pool;