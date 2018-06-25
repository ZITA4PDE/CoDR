'use strict';

const util = require('util');
const sqlStatements = require('../sql-statements');
const db = require('../database');
const fs = require('fs');
const cors = require('../helpers/cors');
const rightsModule = require('../rights');

module.exports = {
    postFile: postFile,
    getFileById: getFileById
};

/**
 * Submits a new file to the specified project.
 * Checks whether a user is allowed to modify the specified project.
 *
 * API Endpoint: GET /modules/{module_id}/courses/{course_id}/exercises
 **/
function postFile(req, res) {
    cors.setHeader(res);
    var projectId = req.swagger.params.project_id.value;
    var files = req.files;

    // Reject request when no file was submitted.
    if (!files || files.length === 0) {
        res.status(405).json({});
        return;
    }

    rightsModule.getProjectRights(req)
    .then(rights => {
        var projectRights = rights.project_rights;
        // Check whether the user is in the project.
        var memberOfProject = projectRights.member_rights.associated_projects.indexOf(projectId) > -1;
        // Check whether the project allows modification for the given user.
        if (req.user.user_level === 0 || (projectRights.other_rights.can_edit || (memberOfProject && projectRights.member_rights.can_edit))) {
            // Insert the files into the database.
            insertFiles(files, projectId)
            .then(function (insertedFiles) {
                res.status(200).json({});
            })
            .catch(() => {
                console.log("Error when inserting files");
                res.status(500).json({});
            });
        } else {
            res.status(401).json({});
        }
    });
}

/**
 * Adds a file to the database for the given project.
 * Splits the file on every line, storing it as an array in the database.
 **/
function insertFiles(files, projectId) {
    const promises = files.map(async (file) => {
        const client = await db.connect();
        var fileData = fs.readFileSync(file.path);
        var splitFile = fileData.toString().split(/\r?\n/);
        var filePath = file.originalname;
        try {
            const result = await client.query(sqlStatements.addFile, [projectId, filePath, splitFile]);
            return(result.rows[0]);
        } catch(e) {
            console.log(e.stack)
            throw 'database error';
        } finally {
            client.release();
        }
    });
    return Promise.all(promises);
};

/**
 * Returns the file with the specified ID.
 * Checks whether a user has the rights to view the given projectgroup.
 *
 * API Endpoint: GET /modules/{module_id}/courses/{course_id}/exercises/{exercise_id}/projects/{project_id}/files/{file_id}
 **/
function getFileById(req, res) {
    cors.setHeader(res);
    var fileId = req.swagger.params.file_id.value;
    var projectId = req.swagger.params.project_id.value;
    rightsModule.getProjectRights(req)
    .then(rights => {
        var projectRights = rights.project_rights;
        // Check whether a user is in the given projectgroup.
        var memberOfProject = projectRights.member_rights.associated_projects.indexOf(projectId) > -1;
        // Check whether the project allows the current user to view the project.
        if (req.user.user_level === 0 || (projectRights.other_rights.can_view || (memberOfProject && projectRights.member_rights.can_view))) {
            (async () => {
                const client = await db.connect();
                try {
                    await client.query('BEGIN');
                    // Get the file from the database with the given ID.
                    const fileResult = await client.query(sqlStatements.getFileById, [fileId]);
                    // Get the comments from the database which belong to this file.
                    const unsortedComments = await client.query(sqlStatements.getCommentsByFileId, [req.user.id, fileId]);
                    await client.query('COMMIT');
                    // Check whether there are any files with the given ID.
                    if (fileResult.rows.length > 0) {
                        var sortedComments = [];
                        // Check whether there are any comments which need sorting.
                        if (unsortedComments.rows.length > 0) {
                            var commentDictionary = {};
                            var rootCommentIds = [];
                            unsortedComments.rows.forEach(row => {
                                delete row.depth;
                                // Delete the line_range field as child comments do not have it.
                                if (row.line_range == null) {
                                    delete row.line_range;
                                }
                                commentDictionary[row.id] = row;
                                if (row.parent_id != null) {
                                    // Add replies as child to their parent comment.
                                    commentDictionary[row.parent_id].children.push(commentDictionary[row.id]);
                                } else {
                                    // Add parent comments as root comments.
                                    rootCommentIds.push(row.id);
                                }
                            });
                            rootCommentIds.forEach(commentId => {
                                // Add all of the root comments with children to the result list.
                                sortedComments.push(commentDictionary[commentId]);
                            });
                        }
                        // Attach all comments to the file which is to be returned to the user.
                        fileResult.rows[0].comments = sortedComments;
                        res.status(200).json(fileResult.rows[0]);
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
