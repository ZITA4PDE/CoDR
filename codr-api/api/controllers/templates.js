'use strict';

const util = require('util');
const sqlStatements = require('../sql-statements');
const db = require('../database');
const cors = require('../helpers/cors');

module.exports = {
    getTemplates: getTemplates,
    postTemplate: postTemplate,
    deleteTemplateById: deleteTemplateById,
    putTemplateById: putTemplateById
};

/**
 * Returns a list of all right templates.
 *
 * API Endpoint: GET /templates
 **/
function getTemplates(req, res) {
    cors.setHeader(res);
    (async () => {
        const client = await db.connect();
        try {
            // Get the right templates from the database.
            const result = await client.query(sqlStatements.getTemplates);
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
 * Creates a new rights template.
 * Requires the current user to be an administrator.
 *
 * API Endpoint: POST /templates
 **/
function postTemplate(req, res) {
    cors.setHeader(res);
    var body = req.swagger.params.body.value;
    var templateContents = body.rights;
   
    // Check whether the user is an administrator.
    if (req.user.user_level !== 0) {
        res.status(401).json({});
        return;
    }

    // Check whether valid input was provided.
    if (!body.name || !templateContents) {
        res.status(405).json({});
        return;
    }

    (async () => {
        const client = await db.connect();
        try {
            // Add the template to the database.
            const templateResult = await client.query(sqlStatements.addTemplate, [body.name]);
            // If the template was succesfully added to the database:
            if (templateResult.rowCount > 0) {
                let query = sqlStatements.addTemplateContent;
                let vars = [];
                let i=1;
                // Insert the template contents into the newly created template.
                for (let j=0;j<templateContents.length;j++) {
                    let content = templateContents[j];
                    vars.push(templateResult.rows[0].id);
                    vars.push(content.id); 
                    vars.push(createBitMask(content.project_rights));
                    vars.push(createBitMask(content.comment_rights));
                    query += '($'+ i++ + ',$' + i++ + ',$' + i++ + ',$' + i++ + ')';
                    if (j < templateContents.length -1) {
                        query += ',';
                    }
                }
                const contentResult = await client.query(query, vars);
                if (contentResult.rowCount > 0) {
                    res.status(201).json({});
                } else {
                    res.status(405).json({});
                }
            } else {
                res.status(405).json({});
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
}

/**
 * Shifts the bits into the correct positions for the bitmask.
 * Refer to the design report to see which position refers to which right.
 **/
function createBitMask(rightsTemplate) {
    var index = 0;
    var mask = 0;
    for (var group in rightsTemplate) {
        for (var right in rightsTemplate[group]) {
            mask |= rightsTemplate[group][right] << index++;
        }
    }
    return mask
}

/**
 * Deletes the specified template.
 * Requires the current user to be an administrator.
 *
 * API Endpoint: DELETE /templates/{template_id}
 **/
function deleteTemplateById(req, res) {
    cors.setHeader(res);
    var templateId = req.swagger.params.template_id.value;

    // Check whether the current user is an administrator.
    if (req.user.user_level != 0) {
        res.status(401).json({});
        return;
    }

    // Check whether a valid template ID was provided.
    if (!templateId) {
        res.status(405).json({});
        return;
    }

    (async () => {
        const client = await db.connect();
        try {
            // Delete the template from the database.
            const result = await client.query(sqlStatements.deleteTemplate, [templateId]);
            console.log("result:");
            console.log(result);
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
 * Updates the specified template.
 * Requires the current user to be an administrator.
 *
 * API Endpoint: PUT /templates/{template_id}
 **/
function putTemplateById(req, res) {
    cors.setHeader(res);
    var body = req.swagger.params.body.value;
    var groupId = body.id;
    var templateId = req.swagger.params.template_id.value;
    var projectRights = body.project_rights;
    var commentRights = body.comment_rights;

    // Checks whether the current user is an administrator.
    if (req.user.user_level != 0) {
        res.status(401).json({});
        return;
    }

    // Checks whether valid input was provided.
    if (!templateId || !groupId || !projectRights || !commentRights) {
        res.status(405).json({});
        return;
    }


    (async () => {
        const client = await db.connect();
        try {
            // Updates the template in the database.
            const result = await client.query(sqlStatements.updateTemplateById, [templateId, groupId, createBitMask(projectRights), createBitMask(commentRights)]);
            if (result.rowCount > 0) {
                res.status(201).json({});
            } else {
                res.status(200).json({});
            }
        } finally {
            client.release();
        }
    })().catch(e => {
        console.log(e.stack);
        if (e.constraint == 'fk_parent_id') {
            res.status(405).json({});
        } else {
            res.status(500).json({});
        }
    });
}
