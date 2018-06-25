'use strict';

const util = require('util');
const sqlStatements = require('../sql-statements');
const db = require('../database');
const cors = require('../helpers/cors');
const rightsModule = require('../rights');

module.exports = {
    getCoursesByModuleId: getCoursesByModuleId,
    postCourseByModuleId: postCourseByModuleId,
    getCourseById: getCourseById,
    deleteCourseById: deleteCourseById,
    putCourseById: putCourseById,
};

/**
 * Gets all courses of the specified module.
 * Checks whether the current user is allowed to view the module.
 *
 * API Endpoint: GET /modules/{module_id}/courses
 **/
function getCoursesByModuleId(req, res) {
    cors.setHeader(res);
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
        // Checks whether the user is allowed to view the module in the first place.
        if (req.user.user_level === 0 || moduleRights && moduleRights.can_view) {
            (async () => {
                const client = await db.connect();
                try {
                    // Get the courses from the current module
                    // The query uses the user ID to get the rights for the specified module for the current user.
                    const result = await client.query(sqlStatements.getCoursesByModuleId, [req.user.id, moduleId]);
                    if (result.rows.length < 1) {
                        // In case there were no courses, check whether the module existed in the first place.
                        // This is done to return to correct error code (404 when the module doesn't exist).
                        const modCheck = await client.query(sqlStatements.getModuleById, [req.user.id, moduleId]);
                        if (modCheck.rows.length > 0) {
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
 * Creates a new course for the specified module.
 * Checks whether the current user has the rights to edit the specified module.
 *
 * API Endpoint: POST /modules/{module_id}/courses
 **/
function postCourseByModuleId(req, res) {
    cors.setHeader(res);
    var moduleId = req.swagger.params.module_id.value;
    var body = req.swagger.params.body.value;

    // Reject input if the name or body is empty.
    if (!body.name || !body.description) {
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
                    // Create the course for the specified module.
                    const result = await client.query(sqlStatements.addCourse, [moduleId, body.name, body.description]);
                    res.status(201).json(result.rows[0]);
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
 * Returns the specified course for the specified module.
 * Checks whether the current user has the rights to view the specified module.
 *
 * API Endpoint: GET /modules/{module_id}/courses/{course_id}
 **/
function getCourseById(req, res) {
    cors.setHeader(res);
    var moduleId = req.swagger.params.module_id.value;
    var courseId = req.swagger.params.course_id.value;
    rightsModule.getModuleRights(req)
    .then(rights => {
        var moduleRights;
        // Find the module rights for the specified module.
        for (var x in rights.modules_rights) {
            if (rights.modules_rights[x].id === moduleId) {
               moduleRights = rights.modules_rights[x];
            }
        }
        // Check whether the user is allowed to view the module to which the course belongs.
        if (req.user.user_level === 0 || moduleRights && moduleRights.can_view) {
            (async () => {
                const client = await db.connect();
                try {
                    // Get the course from the database.
                    // The query returns the correct rights for the current user.
                    const result = await client.query(sqlStatements.getCourseById, [req.user.id, moduleId, courseId]);
                    if (result.rowCount > 0) {
                        res.status(200).json(result.rows[0]);
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
 * Deletes the specified course from the specified module.
 * Checks whether the current user has the rights to edit the specified module.
 *
 * API Endpoint: DELETE /modules/{module_id}/courses/{course_id}
 **/
function deleteCourseById(req, res) {
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
        // Check whether the user is allowed to edit the specified module.
        if (req.user.user_level === 0 || moduleRights && moduleRights.can_edit) {
            (async () => {
                const client = await db.connect();
                try {
                    // Delete the course from the database.
                    const result = await client.query(sqlStatements.deleteCourseById, [courseId]);
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
 * Updates the specified course for the specified module.
 * Checks whether the current user has the rights to edit the specified module.
 *
 * API Endpoint: PUT /modules/{module_id}/courses/{course_id}
 **/
function putCourseById(req, res) {
    cors.setHeader(res);
    var courseId = req.swagger.params.course_id.value;
    var moduleId = req.swagger.params.module_id.value;
    var body = req.swagger.params.body.value;

    // Reject input if the name or body is empty.
    if (!body.name || !body.description) {
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
                    // Update the specified course in the database.
                    const result = await client.query(sqlStatements.updateCourseById, [body.name, body.description, courseId]);
                    if (result.rowCount > 0) {
                        res.status(200).json(result.rows[0]);
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
