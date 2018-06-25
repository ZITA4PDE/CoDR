'use strict';

const util = require('util');
const sqlStatements = require('../sql-statements');
const db = require('../database');
const cors = require('../helpers/cors');
const rightsModule = require('../rights');

module.exports = {
    getModules: getModules,
    postModule: postModule,
    getModuleById: getModuleById,
    deleteModuleById: deleteModuleById,
    putModuleById: putModuleById,
    getCurrentUserGroups: getCurrentUserGroups
};

/**
 * Returns a list of all modules.
 *
 * API Endpoint: GET /modules
 **/
function getModules(req, res) {
    cors.setHeader(res);
    (async () => {
        const client = await db.connect();
        try {
            var response = new Object();
            const result = await client.query(sqlStatements.getModules,[req.user.id]);
            response.modules = result.rows;
            // Adds a can_edit flag if the user is an administrator.
            // This allows to front-end to display extra options.
            response.can_edit = req.user.user_level === 0;
            res.status(200).json(response);
        } finally {
            client.release();
        }
    })().catch(e => {
        console.log(e.stack);
        res.status(500).json({});
    });
}

/**
 * Creates a new module.
 * Requires the user to be an administrator.
 *
 * API Endpoint: POST /modules
 **/
function postModule(req, res) {
    cors.setHeader(res);
    var body = req.swagger.params.body.value;

    // Refuse modules with empty name and/or description.
    if (!body.name || !body.description) {
        res.status(405).json({});
        return;
    }
    
    // Check whether the user is an administrator.
    if (req.user.user_level != 0) {
        res.status(401).json({});
        return;
    }

    (async () => {
        const client = await db.connect();
        try {
            // Add the module to the database.
            const result = await client.query(sqlStatements.addModule, [body.name, body.description]);
            res.status(201).json(result.rows[0]);
        } finally {
            client.release();
        }
    })().catch(e => {
        console.log(e.stack);
        res.status(500).json({});
    });
}

/**
 * Returns the details of the specified module.
 *
 * API Endpoint: GET /modules/{module_id}
 **/
function getModuleById(req, res) {
    cors.setHeader(res);
    var moduleId = req.swagger.params.module_id.value;
    var userId = req.user.id;
    (async () => {
        const client = await db.connect();
        try {
            // Get the specified module from the database.
            const result = await client.query(sqlStatements.getModuleById, [userId, moduleId]);
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
}

/**
 * Deletes the specified module.
 * Requires the user to be an administrator.
 *
 * API Endpoint: DELETE /modules/{module_id}
 **/
function deleteModuleById(req, res) {
    cors.setHeader(res);
    var moduleId = req.swagger.params.module_id.value;
    
    // Check whether the user is an administrator.
    if (req.user.user_level != 0) {
        res.status(401).json({});
        return;
    }

    (async () => {
        const client = await db.connect();
        try {
            // Delete the specified module from the database.
            const result = await client.query(sqlStatements.deleteModuleById, [moduleId]);
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
}

/**
 * Updates the specified module.
 * Checks whether the current user is allowed to edit the specified module.
 *
 * API Endpoint: PUT /modules/{module_id}
 **/
function putModuleById(req, res) {
    cors.setHeader(res);
    var body = req.swagger.params.body.value;
    var moduleId = req.swagger.params.module_id.value;
    var users = body.users;

    // Refuse modules with empty name and/or description.
    if (users == null && (!body.name || !body.description)) {
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
        // Check whether the user is an administrator or is allowed to edit the module.
        if (req.user.user_level === 0 || moduleRights && moduleRights.can_edit) {
            (async () => {
                const client = await db.connect();
                try {
                    var result = {rowcount:0};
                    // Check whether the name and description were updated.
                    if (body.name != null && body.description != null) {
                        // Update the name and description.
                        result = await client.query(sqlStatements.updateModuleById, [body.name, body.description, moduleId]);
                    }
                    // Check whether the users in the module were updated.
                    if (users != null && users.length > 0) {
                        Promise.all(users.map(async (user) => {
                            const client = await db.connect();
                            var userId = user.user_id;
                            var groupId = user.group_id;
                            try {
                                // Update the users in the module.
                                const result = await client.query(sqlStatements.addUserToModule, [moduleId, userId, groupId]);
                                return (result.rowCount > 0);
                            } catch(e) {
                                console.log(e.stack);
                                throw 'database error';
                            } finally {
                                client.release();
                            }
                        })).then(function (addedUsers) {
                            getModuleById(req, res);
                        }).catch(() => {
                            console.log("error when inserting user");
                            res.status(405).json({});
                        });
                    } else {
                        if (result.rowCount > 0) {
                            getModuleById(req, res);
                        } else {
                            res.status(404).json({});
                        }
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
 * Returns the groups for the specified module for the current user.
 *
 * API Endpoint: GET /modules/{module_id}/group
 **/
function getCurrentUserGroups(req, res) {
    cors.setHeader(res);
    var moduleId = req.swagger.params.module_id.value;
    var userId = req.user.id;

    (async () => {
        const client = await db.connect();
        try {
            const result = await client.query(sqlStatements.getGroupsByUserId, [userId, moduleId]);
            if (result.rowCount > 0) {
                res.status(200).json(result.rows);
            } else {
                const modCheck = await client.query(sqlStatements.getModuleById, [userId, moduleId]);
                if (modCheck.rowCount > 0) {
                    res.status(200).json([]);
                } else {
                    res.status(404).json([]);
                }
            }
        } finally {
            client.release();
        }
    })().catch(e => {
        console.log(e.stack);
        res.status(500).json([]);
    });
}
