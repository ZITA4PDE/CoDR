var express = require('express');
var router = express.Router();
const render = require('../helpers/render');
const modules = require('../controllers/modules');
const courses = require('../controllers/courses');
const exercises = require('../controllers/exercises');
const projects = require('../controllers/projects');
const profile = require('../controllers/profile');
const admin = require('../controllers/admin');

/**
 * Route the user to the correct page by parsin the url.
 */
router.use('/modules/:module_id/courses/:course_id/exercises/:exercise_id/projects/:project_id',projects);
router.use('/modules/:module_id/courses/:course_id/exercises/:exercise_id',exercises);
router.use('/modules/:module_id/courses/:course_id',courses);
router.use('/profile',profile);
router.use('/admin',admin);
router.use('/modules',modules);
router.use('/',modules);

module.exports = router;
