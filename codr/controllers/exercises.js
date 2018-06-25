var express = require('express');
var router = express.Router({mergeParams: true});
const render = require('../helpers/render');

/**
 * Main page of exercise
 */
router.get('/',function(req,res,next) {
    render.render(res,'react_sidebar',{
        title: 'Exercise',
        script: '/js/exercise/main.js',
        params: req.params
    })
});

module.exports = router;
