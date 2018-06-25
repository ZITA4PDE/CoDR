var express = require('express');
var router = express.Router();
let render = require('../helpers/render');

module.exports = router;

/**
 * Render the administrator page
 */
router.get('/',function(req,res) {
    render.render(res,'react_sidebar',{
        script: '/js/admin/main.js',
    })
});
