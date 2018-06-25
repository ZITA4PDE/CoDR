var express = require('express');
var config = require('../assets/js/config.js');

/**
 * Renders the given view including some general layout variables.
 * Currently, the only variable that is needed is the logout url.
 */
exports.render = function(res,view,vars) {
    vars.logout=config.api + '/logout';
    res.render(view,vars);
};
