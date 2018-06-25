const sqlStatements = require('./sql-statements');
const db = require('./database');

module.exports = {
    getProjectRights: getProjectRights,
    getCommentRights: getCommentRights,
    getModuleRights: getModuleRights
};

function getModuleRights(req) {
    var userId = req.user.id;
    return new Promise(async (resolve, reject) => {
        const client = await db.connect();
        try {
            const result = await client.query(sqlStatements.getModuleRights, [userId]);
            if (result.rowCount > 0) {
                resolve(result.rows[0]);
            } else {
                reject('rights not found error');
            }
        } finally {
            client.release();
        }
    });
}

function getProjectRights(req) {
    var userId = req.user.id;
    var moduleId = req.swagger.params.module_id.value;
    var exerciseId = req.swagger.params.exercise_id.value;
    return new Promise(async (resolve, reject) => {
        const client = await db.connect();
        try {
            const result = await client.query(sqlStatements.getProjectRights, [userId, moduleId, exerciseId]);
            if (result.rowCount > 0) {
                resolve(result.rows[0]);
            } else {
                reject('rights not found error');
            }
        } finally {
            client.release();
        }
    });
}

function getCommentRights(req) {
    var userId = req.user.id;
    var moduleId = req.swagger.params.module_id.value;
    var exerciseId = req.swagger.params.exercise_id.value;
    var projectId = req.swagger.params.project_id.value;
    return new Promise(async (resolve, reject) => {
        const client = await db.connect();
        try {
            const result = await client.query(sqlStatements.getCommentRights, [userId, moduleId, exerciseId, projectId]);
            if (result.rowCount > 0) {
                resolve(result.rows[0]);
            } else {
                reject('rights not found error');
            }
        } finally {
            client.release();
        }
    });
}

