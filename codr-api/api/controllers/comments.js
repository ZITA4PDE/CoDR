'use strict';

const util = require('util');
const sqlStatements = require('../sql-statements');
const db = require('../database');
const cors = require('../helpers/cors');
const rightsModule = require('../rights');

module.exports = {
    postComment: postComment,
    deleteCommentById: deleteCommentById,
    putCommentById: putCommentById,
    getComments: getComments,
};

/**
 * Adds a new comment to a file for the currently logged in user.
 * Checks whether a user has the rights to create a comment for the project.
 *
 * API Endpoint: GET /modules/{module_id}/courses/{course_id}/exercises/{exercise_id}/projects/{project_id}/files/{file_id}/comments
 **/
function postComment(req, res) {
    cors.setHeader(res);
    var fileId = req.swagger.params.file_id.value;
    var comment = req.swagger.params.comment.value;
    var parentId = comment.parent_id ? comment.parent_id : null; 
    var authorId = req.user.id;
    var timestamp = Math.round(+new Date());
    var projectId = req.swagger.params.project_id.value;

    // Check whether the comment is not falsy, i.e. empty.
    if (!comment.content) {
        res.status(405).json({});
        return;
    }

    // Check whether a line range was provided when there is no parent comment.
    if (parentId === null && !comment.line_range) {
        res.status(405).json({});
        return;
    }

    rightsModule.getProjectRights(req)
    .then(rights => {
        var projectRights = rights.project_rights;
        var memberOfProject = projectRights.member_rights.associated_projects.indexOf(projectId) > -1;
        var admin = req.user.user_level === 0;
        // Checks whether an user can create a visible comment for this file. If they can, the comment will be placed as visible.
        // It is possible that users cannot create visible comments but can create invisible comments, such as a teaching assistant posting feedback ..
        // .. which a teacher has to verifiy before making it visible.
        var visible = admin || projectRights.other_rights.can_create_visible_comment || (memberOfProject && projectRights.member_rights.can_create_visible_comment);
        if (visible || projectRights.other_rights.can_create_comment || (memberOfProject && projectRights.member_rights.can_create_comment)) {
            (async () => {
                const client = await db.connect();
                try {
                    const lengthResult = await client.query(sqlStatements.getFileLengthByFileId, [fileId]);
                   
                    // In case the file didn't exist, return 404 instead of 500.
                    if (lengthResult.rowCount == 0) {
                        res.status(404).json({});
                        client.release();
                        return;
                    }

                    // array_length is the amount of lines in the file as each line is an entry.
                    const maxLength = lengthResult.rows[0].array_length;

                    // In case the comment was a root comment, a check to see whether the line_range is valid is done.
                    if (parentId == null) {
                        var splits = comment.line_range.split(',');
                        for (var i = 0; i < splits.length; i++) {
                            var x = parseInt(splits[i]) || 0;
                            if (x < 1 || x > maxLength) {
                                throw "INVALID_RANGE";
                            }
                        }
                    }

                    // Insert the comment into the database.
                    const result = await client.query(sqlStatements.addComment, [parentId, fileId, comment.line_range, comment.content, authorId, visible, timestamp]);
                    if (result.rowCount > 0) {
                        res.status(201).json({});
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
                    res.status(500).json({});
                }
            });
        } else {
            res.status(401).json({});
        }
    })
    .catch(e => {
        console.log(e);
        res.status(500).json({});
    });
}

/**
 * Deletes a comment by the specified comment ID.
 * Checks whether the user has the rights to delete the specified comment before doing so.
 *
 * API Endpoint: DELETE /modules/{module_id}/courses/{course_id}/exercises/{exercise_id}/projects/{project_id}/files/{file_id}/comments/{comment_id}
 **/
function deleteCommentById(req, res) {
    cors.setHeader(res);
    var commentId = req.swagger.params.comment_id.value;
    rightsModule.getCommentRights(req)
    .then(rights => {
        var commentRights = rights.user_rights.comment_rights;
        // Check whether the user is an administrator, or has the rights to delete comments, or is the author and the comment has the right stating that the author may delete it.
        if (req.user.user_level === 0 || commentRights.can_delete || (commentRights.owner_rights.can_delete && commentRights.owner_rights.owned_comments.indexOf(commentId) > -1)) {
            (async () => {
                const client = await db.connect();
                try {
                    // Remove the comment in the database.
                    const result = await client.query(sqlStatements.deleteComment, [commentId]);
                    if (result.rowCount > 0) {
                        res.status(204).json({});
                    } else {
                        console.log(result)
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
    })
    .catch(e => {
        console.log(e.stack);
        res.status(401);
    });
}

/**
 * Updates a comment by the specified comment ID.
 * Checks whether the user has the rights to update the specified comment before doing so.
 *
 * API Endpoint: PUT /modules/{module_id}/courses/{course_id}/exercises/{exercise_id}/projects/{project_id}/files/{file_id}/comments/{comment_id}
 **/
function putCommentById(req, res) {
    cors.setHeader(res);
    var commentId = req.swagger.params.comment_id.value;
    var body = req.swagger.params.body.value;

    // Check whether the comment is not falsy, i.e. empty.
    if (!body.content) {
        res.status(405).json({});
        return;
    }

    rightsModule.getCommentRights(req)
    .then(rights => {
        var commentRights = rights.user_rights.comment_rights;
        var ownedComment = commentRights.owner_rights.owned_comments.indexOf(commentId) > -1;
        // Check whether the user is an administrator, or has the rights to update comments, or is the author and the comment has the right stating that the author may update it.
        if (req.user.user_level === 0 || commentRights.can_edit || (ownedComment && commentRights.owner_rights.can_edit)) {
            // Similar to the check above, but checks whether the user can toggle comment visibility instead.
            var canToggleVisibility = req.user.user_level === 0 || (commentRights.can_toggle_visibility || (ownedComment && commentRights.owner_rights.can_toggle_visibility)); 
          
            (async () => {
                const client = await db.connect();
                try {
                    var result;

                    if (canToggleVisibility && typeof body.visible !== undefined) {
                        // Updates the comment in the database with the new content and specified visibility.
                        result = await client.query(sqlStatements.updateComment, [body.content, body.visible, commentId]);
                    } else {
                        // Updates the comment in the database with the new content.
                        result = await client.query(sqlStatements.updateCommentContent, [body.content, commentId]);
                    }

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
 * Returns all comments which the current user is allowed to see.
 *
 * API Endpoint: GET /users/current/comments
 **/
function getComments(req, res) {
    cors.setHeader(res);

    (async () => {
        const client = await db.connect();
        try {
            // Uses comments_rights to only return comments where can_view is true.
            const result = await client.query(sqlStatements.getComments, [req.user.id]);
            res.status(200).json(result.rows);
        } finally {
            client.release();
        }
    })().catch(e => {
        console.log(e.stack);
        res.status(500).json({});
    });
}
