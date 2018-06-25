var express = require('express');
var router = express.Router();
var render = require('../helpers/render');

/**
 * Profile page
 */
router.get('/', function(req, res, next) {
    render.render(res,'react_sidebar',{
        script: "/js/profile/main.js"
    });
});

module.exports = router;
