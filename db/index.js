var mysql = require('mysql');

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bjezxkl',
    port: 11073,
    timezone: "08:00"
});

function querySQL(sql, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            callback(err, "");
        } else {
            connection.query(sql, function (err, result, fields) {
                connection.release();//释放链接
                callback(err, result);
            });
        }
    });
}

function querySQLAsync(sql){
    return new Promise((resolve, reject) => {
        querySQL(sql), function (err, result) {
            if (err) {
                return reject({ code: -1, msg: err })
            }
            return resolve({ code: 0, data: result })
        }
    })
}
exports.querySQL = querySQL;
exports.querySQLAsync = querySQLAsync;