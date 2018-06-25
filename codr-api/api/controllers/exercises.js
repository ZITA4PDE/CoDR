'use strict';

const util = require('util');
const sqlStatements = require('../sql-statements');
const db = require('../database');
const cors = require('../helpers/cors');
const rightsModule = require('../rights');

module.exports = {
    getExercises: getExercises,
    postExercise: postExercise,
    getExerciseById: getExerciseById,
    deleteExerciseById: deleteExerciseById,
    putExerciseById: putExerciseById
};

/**
 * Returns a list of exercises for the specified course for the specified module.
 * Checks whether the current user has the rights to view the specified module.
 *
 * API Endpoint: GET /modules/{module_id}/courses/{course_id}/exercises
 **/
function getExercises(req, res) {
    cors.setHeader(res);
    var courseId = req.swagger.params.course_id.value;
    var moduleId = req.swagger.params.module_id.value;
    rightsModule.getModuleRights(req)
    .then(rights => {
        var moduleRights;
        // Find the module rights for the specified module.
        for (var x in rights.modules_rights) {
            if (rights.modules_rights[x].id === moduleId) {
               moduleRights = rights.modules_rights[x];
            }
        }
        // Checks whether the user is allowed to view the specified module.
        if (req.user.user_level === 0 || moduleRights && moduleRights.can_view) {
            (async () => {
                const client = await db.connect();
                try {
                    // Get the exercises for the specified course from the database.
                    const result = await client.query(sqlStatements.getExercisesByCourseId, [courseId]);
                    if (result.rows.length < 1) {
                        // Check whether the course existed if no exercises were found in order to return the ..
                        // .. proper status code.
                        const courseCheck = await client.query(sqlStatements.getCourseById, [moduleId, courseId]);
                        if (courseCheck.rows.length > 0) {
                            res.status(200).json(result.rows);
                        } else {
                            res.status(404).json({});
                        }
                    } else {
                        res.status(200).json(result.rows);
                    }
                } finally {
                    client.release();
                }
            })().catch(e => {
                console.log(e.stack);
                res.status(500).json({});
            });
        } else {
            res.status(401).json({});
        }
    });
}

/**
 * Adds a new exercise to the specified course.
 * Checks whether the current user has the rights to edit the specified module.
 *
 * API Endpoint: /modules/{module_id}/courses/{course_id}/exercises
 **/
function postExercise(req, res) {
    cors.setHeader(res);
    var courseId = req.swagger.params.course_id.value;
    var moduleId = req.swagger.params.module_id.value;
    var body = req.swagger.params.body.value;

    // Refuse exercises with empty name and/or description.
    if (!body.name || !body.description || typeof body.rights_template_id === 'undefined') {
        res.status(405).json({});
        return;
    }
    
    rightsModule.getModuleRights(req)
    .then(rights => {
        var moduleRights;
        // Find the module rights for the specified module.
        for (var x in rights.modules_rights) {
            if (rights.modules_rights[x].id === moduleId) {
               moduleRights = rights.modules_rights[x];
            }
        }
        // Check whether the user is allowed to edit the specified module.
        if (req.user.user_level === 0 || moduleRights && moduleRights.can_edit) {
            (async () => {
                const client = await db.connect();
                try {
                    // Add the exercise to the database for the specified course.
                    const result = await client.query(sqlStatements.addExercise, [courseId, body.rights_template_id, body.name, body.description]);
                    if (result.rows.length > 0) {
                        res.status(201).json(result.rows[0]);
                    } else {
                        res.status(404).json({});
                    }
                } finally {
                    client.release();
                }
            })().catch(e => {
                console.log(e.stack);
                res.status(500).json({});
            });
        } else {
            res.status(401).json({});
        }
    });
}

/**
 * Returns the specified exercise.
 * Checks whether the user is allowed to view the specified module.
 *
 * API Endpoint: GET /modules/{module_id}/courses/{course_id}/exercises/{exercise_id}
 **/
function getExerciseById(req, res) {
    cors.setHeader(res);
    var exerciseId = req.swagger.params.exercise_id.value;
    var moduleId = req.swagger.params.module_id.value;
    rightsModule.getModuleRights(req)
    .then(rights => {
        var moduleRights;
        // Find the module rights for the specified module.
        for (var x in rights.modules_rights) {
            if (rights.modules_rights[x].id === moduleId) {
               moduleRights = rights.modules_rights[x];
            }
        }
        // Check whether the user is allowed to view the specified module.
        if (req.user.user_level === 0 || moduleRights && moduleRights.can_view) {
            (async () => {
                const client = await db.connect();
                try {
                    // Get the specified exercise from the database.
                    const result = await client.query(sqlStatements.getExerciseById, [req.user.id, exerciseId]);
                    if (result.rows.length > 0) {
                        res.status(200).json(result.rows[0]);
                    } else {
                        res.status(404).json({});
                    }
                } finally {
                    client.release();
                }
            })().catch(e => {
                if (e.constraint == 'fk_parent_id') {
                    res.status(405).json({});
                } else {
                    console.log(e);
                    res.status(500).json({});
                }
            });
        } else {
            res.status(401).json({});
        }
    });
}

/**
* Deletes the specified exercise.
* Checks whether the current user is allowed to edit the specified module.
*
* API Endpoint: DELETE /modules/{module_id}/courses/{course_id}/exercises/{exercise_id}
**/
function deleteExerciseById(req, res) {
    cors.setHeader(res);
    var exerciseId = req.swagger.params.exercise_id.value;
    var moduleId = req.swagger.params.module_id.value;
    rightsModule.getModuleRights(req)
    .then(rights => {
        var moduleRights;
        // Find the module rights for the specified module.
        for (var x in rights.modules_rights) {
            if (rights.modules_rights[x].id === moduleId) {
               moduleRights = rights.modules_rights[x];
            }
        }
        // Check whether the current user is allowed to edit the specified module.
        if (req.user.user_level === 0 || moduleRights && moduleRights.can_edit) {
            (async () => {
                const client = await db.connect();
                try {
                    // Delete the exercise from the database.
                    const result = await client.query(sqlStatements.deleteExerciseById, [exerciseId]);
                    if (result.rowCount > 0) {
                        res.status(200).json({});
                    } else {
                        res.status(404).json({});
                    }
                } finally {
                    client.release();
                }
            })().catch(e => {
                console.log(e.stack);
                res.status(500).json({});
            });
        } else {
            res.status(401).json({});
        }
    });
}

/**
 * Updates the specified exercise.
 * Checks whether the current user is allowed to edit the specified module.
 *
 * API Endpoint: PUT /modules/{module_id}/courses/{course_id}/exercises/{exercise_id}
 **/
function putExerciseById(req, res) {
    cors.setHeader(res);
    var exerciseId = req.swagger.params.exercise_id.value;
    var moduleId = req.swagger.params.module_id.value;
    var body = req.swagger.params.body.value;

    // Refuse exercises with empty name and/or description.
    if (!body.name || !body.description || typeof body.rights_template_id === 'undefined') {
        res.status(405).json({});
        return;
    }
    
    rightsModule.getModuleRights(req)
    .then(rights => {
        var moduleRights;
        // Find the module rights for the specified module.
        for (var x in rights.modules_rights) {
            if (rights.modules_rights[x].id === moduleId) {
               moduleRights = rights.modules_rights[x];
            }
        }
        // Check whether the current user is allowed to edit the specified module.
        if (req.user.user_level === 0 || moduleRights && moduleRights.can_edit) {
            (async () => {
                const client = await db.connect();
                try {
                    // Update the exercise in the database.
                    const result = await client.query(sqlStatements.updateExerciseById, [body.rights_template_id, body.name, body.description, exerciseId]);
                    console.log(result);
                    if (result.rowCount > 0) {
                        res.status(200).json(result.rows[0]);
                    } else {
                        res.status(404).json({});
                    }
                } finally {
                    client.release();
                }
            })().catch(e => {
                if (e.constraint == 'fk_parent_id') {
                    res.status(405).json({});
                } else {
                    res.status(500).json({});
                }
            });
        } else {
            res.status(401).json({});
        }
    });
}
