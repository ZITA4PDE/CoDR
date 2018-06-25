'use strict';

const util = require('util');
const format = require('pg-format');
const sqlStatements = require('../sql-statements');
const db = require('../database');
const cors = require('../helpers/cors');

module.exports = {
    getRightGroups: getRightGroups,
    postRightGroup: postRightGroup,
    deleteRightGroupById: deleteRightGroupById,
    putRightGroupById: putRightGroupById
};

/**
 * Returns a list of all right groups.
 *
 * API Endpoint: GET /right_groups
 **/
function getRightGroups(req, res) { 
    cors.setHeader(res);
    (async () => {
        const client = await db.connect();
        try {
            // Get the right groups from the database.
            const result = await client.query(sqlStatements.getRightGroups);
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
 * Creates a new right group.
 * Requires the user to be an administrator.
 *
 * API Endpoint: POST /right_groups
 **/
function postRightGroup(req, res) {
    cors.setHeader(res);

    // Check whether the user is an administrator.
    if (req.user.user_level != 0) {
        res.status(401).json({});
        return;
    }
    
    let description = req.swagger.params.body.value.description;

    // Check whether a description was provided.
    if (description == null) {
        res.status(405).json({});
        return;
    }

    (async () => {
        const client = await db.connect();
        try {
            // Add the right group to the database.
            const result = await client.query(sqlStatements.addRightGroup, [description]);  
            const rowRes = result.rows[0];

            // Add the right group to a template in the database.
            const addRes = await client.query(sqlStatements.addRightGroupToTemplates, [rowRes.id]);
            res.status(201).json(rowRes);
        } finally {
            client.release();
        }
    })().catch(e => {
        console.log(e.stack);
        res.status(500).json({});
    });
}

/**
 * Deletes the specified right group.
 * Requires the user to be an administrator.
 *
 * API Endpoint: DELETE /right_groups/{right_group_id}
 **/
function deleteRightGroupById(req, res) {
    cors.setHeader(res);
    
    // Check whether the current user is an administrator.
    if (req.user.user_level != 0) {
        res.status(401).json({});
        return;
    }
     
    let rightGroupId = req.swagger.params.right_group_id.value;
    
    // Check whether a right group was provided.
    if (!rightGroupId) {
        res.status(405).json({});
        return;
    }

    (async () => {
        const client = await db.connect();
        try {
            // Delete the specified right group from the database.
            const result = await client.query(sqlStatements.deleteRightGroupById, [rightGroupId]);  
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
        if (e.constraint == 'fk_parent_id') {
            res.status(404).json({});
        } else {
            res.status(500).json({});
        }
    });
}

/**
 * Updates the specified right group.
 * Requires the user to be an administrator.
 *
 * API Endpoint: PUT /right_groups/{right_group_id}
 **/
function putRightGroupById(req, res) {
    cors.setHeader(res);

    // Check whether the current user is an administrator.
    if (req.user.user_level != 0) {
        res.status(401).json({});
        return;
    }

    let rightGroupId = req.swagger.params.right_group_id.value
    let description = req.swagger.params.body.value.description;

    if (!rightGroupId || !description) {
        res.status(405).json({});
        return;
    }

    (async () => {
        const client = await db.connect();
        try {
            // Update the specified group in the database.
            const result = await client.query(sqlStatements.updateRightGroupById, [rightGroupId, description]);
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
        if (e.constraint == 'fk_parent_id') {
            res.status(404).json({});
        } else {
            res.status(500).json({});
        }
    });
}
