exports.setHeader = function (res) {
    res.header('Access-Control-Allow-Origin', process.env.CORS_HOST);
};
