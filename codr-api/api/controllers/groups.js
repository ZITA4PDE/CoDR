'use strict';

const util = require('util');
const format = require('pg-format');
const sqlStatements = require('../sql-statements');
const db = require('../database');
const cors = require('../helpers/cors');
const rightsModule = require('../rights');

module.exports = {
    getGroups: getGroups,
    postGroup: postGroup,
    getGroupById: getGroupById,
    deleteGroupById: deleteGroupById,
    putGroupById: putGroupById,
};

/**
 * Returns a list of all groups in the database.
 * Requires the user to be an administrator.
 *
 * API Endpoint: GET /groups
 **/
function getGroups(req, res) { 
    cors.setHeader(res);

    // Check whether the user is an administrator.
    if (req.user.user_level != 0) {
        res.status(401).json({});
        return;
    }

    (async () => {
        const client = await db.connect();
        try {
            // Get the groups from the database.
            const result = await client.query(sqlStatements.getGroups);
            res.status(200).json(result.rows);
        } finally {
            client.release();
        }
    })().catch(e => {
        console.log(e.stack);
        res.status(500).json({});
    });
}

/**
 * Returns a list of all groups.
 * Requires the user to be allowed to view (be part of) a module.
 *
 * API Endpoint: POST /groups
 **/
function postGroup(req, res) {
    cors.setHeader(res);
    let moduleId = req.swagger.params.body.value.module_id;

    // Only allow people in the module to create groups.
    // Administrators have can_view set for every module.
    rightsModule.getModuleRights(req)
    .then(rights => {
        var moduleRights;
        for (var x in rights.modules_rights) {
            if (rights.modules_rights[x].id === moduleId) {
                moduleRights = rights.modules_rights[x];
            }
        }
        console.log(moduleRights);
        if (!(moduleRights && moduleRights.can_view)) {
            res.status(401).json({});
            return;
        }
    });

    // Refuse groups without module id.
    if (typeof moduleId === 'undefined') {
        res.status(405).json({});
        return;
    }

    (async () => {
        const client = await db.connect();
        try {
            // Create a new group in the database for the given module.
            const result = await client.query(sqlStatements.addGroup, [moduleId]);
            // Add the module id to the result to conform to API specification.
            result.rows[0].module_id = moduleId;
            // Add the current user to the newly created group.
            await client.query(sqlStatements.addUserToGroup, [result.rows[0].id, req.user.id]);

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
 * Returns the details of the specified group.
 * Checks whether the user is an administrator, moderator for the module, or user in the group.
 *
 * API Endpoint: GET /groups/{group_id}
 **/
function getGroupById(req, res) {
    cors.setHeader(res);
    var groupId = req.swagger.params.group_id.value;

    (async () => {
        const client = await db.connect();
        try {
            const result = await client.query(sqlStatements.getGroupById, [groupId]);
            if (result.rows.length > 0) {
                var groupDetails = result.rows[0];

                // Check whether the user is an administrator
                // or moderator for this module.
                rightsModule.getModuleRights(req)
                .then(rights => {
                    var moduleRights;
                    for (var x in rights.modules_rights) {
                        if (rights.modules_rights[x].id === groupDetails.module_id) {
                            moduleRights = rights.modules_rights[x];
                        }
                    }

                    var canAccess = false;

                    // User is an administrator or moderator for the module.
                    if (moduleRights && moduleRights.can_edit) {
                        canAccess = true;
                    }

                    // Check whether the user is in the group.
                    for (var i = 0; i < groupDetails.users.length; i++) {
                         if (req.user.id === groupDetails.users[i].id) {
                             canAccess = true;
                         }
                    }

                    if (canAccess) {
                        res.status(200).json(groupDetails);
                    } else {
                        res.status(401).json({});
                    }
                }).catch(e => {
                    console.log(e.stack);
                    res.status(500).json({});
                    return;
                });
            } else {
                res.status(404).json({});
            }
        } finally {
            client.release();
        }
    })().catch(e => {
        console.log(e.stack);
        res.status(500).json({});
        return;
    });
}

/**
 * Deletes the specified group.
 * Checks whether the user is an administrator, moderator for the module, or user in the group.
 *
 * API Endpoint: DELETE /groups/{group_id}
 **/
function deleteGroupById(req, res) {
    cors.setHeader(res);
    var groupId = req.swagger.params.group_id.value;

    (async () => {
        const client = await db.connect();
        try {
            const result = await client.query(sqlStatements.getGroupById, [groupId]);
            if (result.rows.length > 0) {
                var groupDetails = result.rows[0];

                // Check whether the user is an administrator
                // or moderator for this module.
                rightsModule.getModuleRights(req)
                .then(rights => {
                    var moduleRights;
                    for (var x in rights.modules_rights) {
                        if (rights.modules_rights[x].id === groupDetails.module_id) {
                            moduleRights = rights.modules_rights[x];
                        }
                    }

                    var canAccess = false;

                    // User is an administrator or moderator for the module.
                    if (moduleRights && moduleRights.can_edit) {
                        canAccess = true;
                    }

                    // Check whether the user is in the group.
                    for (var i = 0; i < groupDetails.users.length; i++) {
                         if (req.user.id === groupDetails.users[i].id) {
                             canAccess = true;
                         }
                    }

                    if (canAccess) {
                        (async () => {
                            const result = await client.query(sqlStatements.deleteGroupById, [groupId]);
                            if (result.rowCount > 0) {
                                res.status(204).json({});
                            } else {
                                res.status(404).json({});
                            }
                        })().catch(e => {
                            console.log(e.stack);
                            res.status(500).json({});
                        });
                    } else {
                        res.status(401).json({});
                    }
                }).catch(e => {
                    console.log(e.stack);
                    res.status(500).json({});
                    return;
                });
            } else {
                res.status(404).json({});
            }
        } finally {
            client.release();
        }
    })().catch(e => {
        console.log(e.stack);
        res.status(500).json({});
        return;
    });
}

/**
 * Updates the specified group.
 * Checks whether the user is an administrator, moderator for the module, or user in the group.
 *
 * API Endpoint: PUT /groups/{group_id}
 **/
function putGroupById(req, res) {
    cors.setHeader(res);
    var groupId = req.swagger.params.group_id.value;
    var users = req.swagger.params.body.value;

    (async () => {
        const client = await db.connect();
        try {
            const result = await client.query(sqlStatements.getGroupById, [groupId]);
            if (result.rows.length > 0) {
                var groupDetails = result.rows[0];

                // Check whether the user is an administrator
                // or moderator for this module.
                rightsModule.getModuleRights(req)
                .then(rights => {
                    var moduleRights;
                    for (var x in rights.modules_rights) {
                        if (rights.modules_rights[x].id === groupDetails.module_id) {
                            moduleRights = rights.modules_rights[x];
                        }
                    }

                    var canAccess = false;

                    // User is an administrator or moderator for the module.
                    if (moduleRights && moduleRights.can_edit) {
                        canAccess = true;
                    }

                    // Check whether the user is in the group.
                    for (var i = 0; i < groupDetails.users.length; i++) {
                         if (req.user.id === groupDetails.users[i].id) {
                             canAccess = true;
                         }
                    }

                    if (canAccess) {
                        var group = new Object();
                        group.id = groupId;
                        group.users = users;

                        var values = [];
                        users.forEach(function (user) {
                            if (user.hasOwnProperty('id')) {
                                values.push([groupId, user.id]);
                            } else {
                                res.status(400).json({});
                            }
                        });

                        (async () => {
                            const client = await db.connect();
                            try {
                                await client.query('BEGIN');
                                // Deletes all users from the group.
                                await client.query(sqlStatements.deleteGroupUsersById, [groupId]);

                                if (values.length > 0) {
                                    // In case all users were deleted from the group
                                    await client.query(format(sqlStatements.putGroupById, values));
                                }

                                await client.query('COMMIT');
                                res.status(200).json(group);
                            } catch (e) {
                                await client.query('ROLLBACK');
                                throw e
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
                }).catch(e => {
                    console.log(e.stack);
                    res.status(500).json({});
                    return;
                });
            } else {
                res.status(404).json({});
            }
        } finally {
            client.release();
        }
    })().catch(e => {
        console.log(e.stack);
        res.status(500).json({});
        return;
    });
}
