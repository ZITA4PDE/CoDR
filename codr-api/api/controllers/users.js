'use strict';

const util = require('util');
const sqlStatements = require('../sql-statements');
const db = require('../database');
const cors = require('../helpers/cors');

module.exports = {
    getUsers: getUsers,
    getCurrentUser: getCurrentUser,
    getUserById: getUserById,
    deleteUserById: deleteUserById,
    putUserById: putUserById,
    getUserCommentsById: getUserCommentsById
};

/**
 * Returns a list of all user accounts.
 *
 * API Endpoint: GET /users
 **/
function getUsers(req, res) {
    cors.setHeader(res);

    (async () => {
        const client = await db.connect();
        try {
            const result = await client.query(sqlStatements.getUsers);
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
 * Returns information for the currently logged in user.
 *
 * API Endpoint: GET /users/current
 **/
function getCurrentUser(req, res) {
    cors.setHeader(res);
    if (!req.user) {
        rest.status(401).json({});
        return;
    }
    res.status(200).json(req.user);
}

/**
 * Returns the details of the specified user account.
 * Requires the user to be an administrator.
 *
 * API Endpoint: GET /users/{user_id}
 **/
function getUserById(req, res) {
    cors.setHeader(res);

    // Only administrators are allowed to view user details.
    if (req.user.user_level != 0) {
        res.status(401).json({});
        return;
    }

    var userId = req.swagger.params.user_id.value;

    // Check whether a valid user ID was provided.
    if (userId === null) {
        res.status(405).json({});
    }

    (async () => {
        const client = await db.connect();
        try {
            // Get the user details from the database.
            const result = await client.query(sqlStatements.getUserById, [userId]);
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
 * Deletes the specified user from the database.
 * Requires the current user to be an administrator.
 *
 * API Endpoint: DELETE /users/{user_id}
 **/
function deleteUserById(req, res) {
    cors.setHeader(res);

    // Only administrators are allowed to delete users.
    if (req.user.user_level != 0) {
        res.status(401).json({});
        return;
    }

    var userId = req.swagger.params.user_id.value;

    // Checks whether a user ID is provided.
    if (userId === null) {
        res.status(405).json({});
        return;
    }

    (async () => {
        const client = await db.connect();
        try {
            // Delete the user in the database.
            const result = await client.query(sqlStatements.deleteUserById, [userId]);
            if (result.rowCount > 0) {
                res.status(204).json({});
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
 * Updates the specified user in the database.
 * Requires the user to be an administrator.
 *
 * API Endpoint: PUT /users/{user_id}
 **/
function putUserById(req, res) {
    cors.setHeader(res);

    // Only administrators are allowed to update usernames.
    if (req.user.user_level != 0) {
        res.status(401).json({});
        return;
    }

    var userId = req.swagger.params.user_id.value;
    var name = req.swagger.params.body.value.display_name;

    // Check whether the user ID and name are provided.
    if (userId === null || !name) {
        res.status(405).json({});
        return;
    }

    (async () => {
        const client = await db.connect();
        try {
            // Updates the specified user ID in the database.
            const result = await client.query(sqlStatements.updateUserById, [name, userId]);
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
}

/**
 * Returns all comments for the specified user.
 * Only returns comments which the current user is allowed to view.
 *
 * API Endpoint: GET /users/{user_id}/comments
 **/
function getUserCommentsById(req, res) {
    cors.setHeader(res);
    var userId = req.swagger.params.user_id.value;

    // Checks whether a user ID was provided.
    if (userId === null) {
        res.status(405).json({});
        return;
    }

    (async () => {
        const client = await db.connect();
        try {
            // Uses comments_rights to only return comments where can_view is true.
            const result = await client.query(sqlStatements.getUserCommentsById, [userId, req.user.id]);
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
 * Helper function to add data from a query to a list.
 **/
function createResultList(queryResult) {
    var resultList = [];
    for (var i in queryResult) {
        resultList.push(queryResult[i].dataValues);
    }
    return resultList;
}
