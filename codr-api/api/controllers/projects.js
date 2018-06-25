'use strict';

const util = require('util');
const sqlStatements = require('../sql-statements');
const db = require('../database');
const cors = require('../helpers/cors');
const rightsModule = require('../rights');

module.exports = {
    getProjects: getProjects,
    postProject: postProject,
    getProjectById: getProjectById,
    deleteProjectById: deleteProjectById,
    putProjectById: putProjectById
};

/**
 * Returns all projects for the given exercise.
 * Requires the current user to be allowed to view the module.
 *
 * API Endpoint: GET /modules/{module_id}/courses/{course_id}/exercises/{exercise_id}/projects
 **/
function getProjects(req, res) {
    cors.setHeader(res);
    var exerciseId = req.swagger.params.exercise_id.value;
    var moduleId = req.swagger.params.module_id.value;
    rightsModule.getModuleRights(req)
    .then(rights => {
        var moduleRights;
        // Get the rights for the specified module.
        for (var x in rights.modules_rights) {
            if (rights.modules_rights[x].id === moduleId) {
               moduleRights = rights.modules_rights[x];
            }
        }
        // Check whether the user is an administrator or allowed to view the module.
        if (req.user.user_level === 0 || moduleRights && moduleRights.can_view) {
            (async () => {
                const client = await db.connect();
                try {
                    // Get the projects for the specified exercise.
                    const result = await client.query(sqlStatements.getProjectsByExerciseId, [req.user.id, exerciseId]);
                    if (result.rows.length < 1) {
                        // In case there were no projects, check whether the exercise exists.
                        const exCheck = await client.query(sqlStatements.getExerciseById, [req.user.id, exerciseId]);
                        if (exCheck.rows.length > 0) {
                            // Return the exercise without any projects.
                            res.status(200).json({});
                        } else {
                            // The specified exercise did not exist, return a 404.
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
 * Adds a new project to the specified exercise.
 * Requires the current user to be allowed to view the module.
 *
 * API Endpoint: POST /modules/{module_id}/courses/{course_id}/exercises/{exercise_id}/projects
 **/
function postProject(req, res) {
    cors.setHeader(res);
    var exerciseId = req.swagger.params.exercise_id.value;
    var body = req.swagger.params.body.value;
    var authorId = req.user.id;
    var moduleId = req.swagger.params.module_id.value;
    
    if (!body.projectgroup_id) {
        res.status(405).json({});
        return;
    }

    rightsModule.getModuleRights(req)
    .then(rights => {
        var moduleRights;
        // Get the rights for the specified module.
        for (var x in rights.modules_rights) {
            if (rights.modules_rights[x].id === moduleId) {
               moduleRights = rights.modules_rights[x];
            }
        }
        // Check whether the current user is an administrator or allowed to view the module.
        if (req.user.user_level === 0 || moduleRights && moduleRights.can_view) {
            (async () => {
                const client = await db.connect();
                try {
                    // Add the new project to the database.
                    const result = await client.query(sqlStatements.addProject, [exerciseId, authorId, body.projectgroup_id]);
                    if (result.rows.length > 0) {
                        res.status(201).json(result.rows[0]);
                    } else {
                        res.status(404).json({});
                    }
                } finally {
                    client.release();
                }
            })().catch(e => {
                if (e.constraint == 'fk_parent_id' || e === "INVALID_RANGE") {
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
 * Returns the details of the specified project.
 * Requires the current user to be allowed to view the specified project.
 *
 * API Endpoint: GET /modules/{module_id}/courses/{course_id}/exercises/{exercise_id}/projects/{project_id}
 **/
function getProjectById(req, res) {
    cors.setHeader(res);
    var projectId = req.swagger.params.project_id.value;
    var moduleId = req.swagger.params.module_id.value;
    var userId = req.user.id;
    rightsModule.getProjectRights(req)
    .then(rights => {
        // Gets the rights for the given project.
        var projectRights = rights.project_rights;
        // Checks whether the member is a member of the projectgroup.
        var memberOfProject = projectRights.member_rights.associated_projects.indexOf(projectId) > -1;
        // Checks whether the given user is allowed to view the specified project.
        if (req.user.user_level === 0 || (projectRights.other_rights.can_view || (memberOfProject && projectRights.member_rights.can_view))) {
            (async () => {
                const client = await db.connect();
                try {
                    // Get the details of the project from the database.
                    const result = await client.query(sqlStatements.getProjectById, [userId, projectId]);
                    if (result.rows.length > 0) {
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
 * Deletes the specified project.
 * Requires the current user the be allowed to delete the specified module.
 *
 * API Endpoint: DELETE /modules/{module_id}/courses/{course_id}/exercises/{exercise_id}/projects/{project_id}
 **/
function deleteProjectById(req, res) {
    cors.setHeader(res);
    var projectId = req.swagger.params.project_id.value;
    var moduleId = req.swagger.params.module_id.value;
    rightsModule.getProjectRights(req)
    .then(rights => {
        // Gets the projectrights for the current user.
        var projectRights = rights.project_rights;
        // Checks whether the current user is a member of the projectgroup.
        var memberOfProject = projectRights.member_rights.associated_projects.indexOf(projectId) > -1;
        // Checks whether the user is an administrator or has the rights to delete the module.
        if (req.user.user_level === 0 || (projectRights.other_rights.can_delete || (memberOfProject && projectRights.member_rights.can_delete))) {
            (async () => {
                const client = await db.connect();
                try {
                    // Delete the project in the database.
                    const result = await client.query(sqlStatements.deleteProjectById, [projectId]);
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
 * Updates the specified project.
 * Checks whether the current user is allowed to edit the specified project.
 *
 * API Endpoint: PUT /modules/{module_id}/courses/{course_id}/exercises/{exercise_id}/projects/{project_id}
 **/
function putProjectById(req, res) {
    cors.setHeader(res);
    var projectId = req.swagger.params.project_id.value;
    var exerciseId = req.swagger.params.exercise_id.value;
    var body = req.swagger.params.body.value;
    var moduleId = req.swagger.params.module_id.value;
    rightsModule.getProjectRights(req)
    .then(rights => {
        // Gets the rights for the specified project.
        var projectRights = rights.project_rights;
        // Checks whether the current user is a member of the project.
        var memberOfProject = projectRights.member_rights.associated_projects.indexOf(projectId) > -1;
        // Checks whether the current user is an administrator or allowed to edit the project.
        if (req.user.user_level === 0 || (projectRights.other_rights.can_edit || (memberOfProject && projectRights.member_rights.can_edit))) {
            (async () => {
                const client = await db.connect();
                try {
                    // Updates the project in the database.
                    const result = await client.query(sqlStatements.updateProjectById, [exerciseId, body.projectgroup_id, projectId]);
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
