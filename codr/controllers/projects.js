var express = require('express');
var router = express.Router({mergeParams: true});
const render = require('../helpers/render');

router.get('/',function(req,res,next) {
    render.render(res,'react_sidebar', {
        script: "/js/project/main.js",
        params: req.params,
    });
});

router.get('/files/:file_id',function(req,res,next) {
    render.render(res,'react_sidebar',{
        script: "/js/project/file.js",
        params: req.params
    });
});

module.exports = router;