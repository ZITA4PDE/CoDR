var express = require('express');
var router = express.Router();
const render = require('../helpers/render');

/**
 * Page with list of modules
 */
router.get('/',function(req, res, next) {
    render.render(res,'modules',{
        title: 'Modules',
    });
});

/**
 * Main page of module
 */
router.get('/:module_id', function(req,res,next) {
    render.render(res,'react_sidebar',{
        title: 'Module',
        script: '/js/module/main.js',
        params: req.params,
    })
});

module.exports = router;
