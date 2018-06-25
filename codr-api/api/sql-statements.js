exports.getRightGroups = "SELECT id, description FROM groups";
exports.addRightGroup = "INSERT INTO groups (description) VALUES ($1) RETURNING id,description";
exports.addRightGroupToTemplates = `
INSERT INTO templates_content(template_id, group_id, project_right, comment_right)
SELECT id, $1 AS g, '0' AS p, '0' as c FROM templates
`
exports.deleteRightGroupById = "DELETE FROM groups WHERE groups.id = $1";
exports.updateRightGroupById = "UPDATE groups SET description = $2 WHERE groups.id = $1";

exports.createUserIfNotExists = `
INSERT INTO users(id, session_id, user_level, display_name)
SELECT nextval('users_id_seq'::regclass), 'UNUSED', 1, $1
WHERE NOT EXISTS(SELECT id FROM users WHERE display_name = $1);
`
exports.getUserByName = "SELECT * FROM users WHERE display_name = $1";
exports.getUsers = "SELECT DISTINCT id, display_name FROM USERS";
exports.getUserById = "SELECT DISTINCT id, user_level, display_name FROM users WHERE users.id = $1";
exports.deleteUserById = "DELETE FROM users WHERE users.id = $1";
exports.updateUserById = "UPDATE users SET display_name = $1 WHERE users.id = $2 RETURNING id, display_name";
exports.getUserCommentsById = `
SELECT c.module_id, c.course_id, c.exercise_id, c.project_id, c.id, c.parent_id, c.file_id, c.line_range, c.content, c.author_id, c.visible, c.timestamp, c.deleted, c.can_edit, c.can_delete, c.can_toggle_visibility
FROM comments_rights($2) c
WHERE c.author_id = $1 AND c.can_view;`

exports.getGroups = `SELECT
    projectgroup.id,
    projectgroup.module_id,
    (
    SELECT COALESCE(json_agg(row_to_json(c)) FILTER (WHERE c.id IS NOT NULL), '[]') --Select all users for group as json object
        FROM (
            SELECT
                user_id AS id,
                    (
                    SELECT display_name
                    FROM users
                    WHERE users.id = projectgroup_users.user_id
               )
            FROM projectgroup_users
            WHERE projectgroup_users.projectgroup_id = projectgroup.id
        ) c
    ) AS        users
FROM projectgroup`
exports.addGroup = "INSERT INTO projectgroup (module_id) VALUES ($1) RETURNING id;";
exports.getGroupById = `SELECT
    projectgroup.id,
    projectgroup.module_id,
    (
    SELECT COALESCE(json_agg(row_to_json(c)) FILTER (WHERE c.id IS NOT NULL), '[]') --Select all users for group as json object
        FROM (
            SELECT
                user_id AS id,
                    (
                    SELECT display_name
                    FROM users
                    WHERE users.id = projectgroup_users.user_id
               )
            FROM projectgroup_users
            WHERE projectgroup_users.projectgroup_id = projectgroup.id
        ) c
    ) AS        users
FROM projectgroup
WHERE projectgroup.id = $1`
exports.deleteGroupById = "DELETE FROM projectgroup WHERE id = $1;";
exports.deleteGroupUsersById = "DELETE FROM projectgroup_users WHERE projectgroup_id = $1;";
exports.putGroupById = "INSERT INTO projectgroup_users VALUES %L ON CONFLICT DO NOTHING;";
exports.addUserToGroup = "INSERT INTO projectgroup_users VALUES ($1, $2);";

exports.getModules = "SELECT * FROM modules_rights($1) WHERE can_view";
exports.addModule = "INSERT INTO modules (name, description) VALUES ($1, $2) RETURNING id, name, description";
exports.getModuleById = `
SELECT
    m.id,
    m.name,
    m.description,
    m.can_edit,
    (
    SELECT COALESCE(json_agg(row_to_json(c)) FILTER (WHERE c.id IS NOT NULL), '[]') --Select courses as json object
        FROM (
            SELECT
                id,
                name,
                description
                FROM courses
                WHERE courses.module_id = m.id
        ) c
    ) AS        courses,
    (SELECT COALESCE(json_agg(row_to_json(g)) FILTER (WHERE g.group_id IS NOT NULL), '[]') --Select group as json object including group users
        FROM (
            SELECT
                g.id as group_id,
                g.description,
                json_agg(json_build_object('id', u.id, 'display_name', u.display_name)) as users
            FROM users u, module_users mu, groups g
            WHERE g.id = mu.group_id and mu.user_id = u.id and mu.module_id = $2
            GROUP BY g.id, g.description
        ) AS g
    ) AS groups
FROM modules_rights($1) m
WHERE m.id = $2
AND m.can_view`
exports.deleteModuleById = "DELETE FROM modules WHERE modules.id = $1";
exports.updateModuleById = "UPDATE modules SET name = $1, description = $2 WHERE modules.id = $3 RETURNING id, name, description";
exports.addUserToModule = "INSERT INTO module_users (module_id, user_id, group_id) VALUES ($1, $2, $3)";
exports.getGroupsByUserId = `
SELECT p.id AS group_id,
    (SELECT COALESCE(json_agg(row_to_json(u)) FILTER (WHERE u.id IS NOT NULL), '[]')
        FROM (
            SELECT u.id, u.display_name
            FROM users u, projectgroup_users pu
            WHERE pu.projectgroup_id = p.id
            AND pu.user_id = u.id) as u) as users
FROM projectgroup p, projectgroup_users pu 
WHERE pu.projectgroup_id = p.id 
AND pu.user_id = $1 
AND p.module_id = $2`;

exports.getCoursesByModuleId = "SELECT c.*, m.can_edit FROM courses c, modules_rights($1) m WHERE c.module_id = $2 AND m.id = $2";
exports.addCourse = "INSERT INTO courses (module_id, name, description) VALUES ($1, $2, $3) RETURNING id, name, description";
exports.getCourseById = `
SELECT
    c.id,
    c.name,
    c.description,
    m.can_edit,
    (
        SELECT COALESCE(json_agg(row_to_json(e)) FILTER (WHERE e.id IS NOT NULL), '[]') --Select exercise as json object
        FROM (
            SELECT
                id,
                name,
                description
            FROM exercises
            WHERE exercises.course_id = c.id
        ) e
    )  exercises
    FROM courses c, modules_rights($1) m
    WHERE c.module_id = $2
    AND m.id = c.module_id
    AND c.id = $3`
exports.deleteCourseById = "DELETE FROM courses WHERE id = $1";
exports.updateCourseById = "UPDATE courses SET name = $1, description = $2 WHERE courses.id = $3 RETURNING id, name, description";
exports.getExercisesByCourseId = "SELECT * FROM exercises WHERE course_id = $1";
exports.addExercise = "INSERT INTO exercises (course_id, rights_template_id, name, description) VALUES ($1, $2, $3, $4) RETURNING id, course_id, rights_template_Id, name, description";
exports.getExerciseById = `
SELECT
    e.id,
    e.name,
    e.description,
    e.rights_template_id,
    m.can_edit,
    (
    SELECT COALESCE(json_agg(row_to_json(p)) FILTER (WHERE p.id IS NOT NULL), '[]') --Select projects as json object
        FROM (
            SELECT
                pr.id,
                pr.exercise_id,
                pr.author_id,
                pr.projectgroup_id,
                pr.can_delete,
                (SELECT row_to_json(p) FROM
                (` + exports.getGroupById.replace('$1','pr.projectgroup_id') +
                `) p ) as projectgroup
                FROM projects_rights($1) pr
                WHERE pr.exercise_id = e.id
                AND pr.can_view
        ) p
    ) AS projects
FROM exercises e, modules_rights($1) m, courses c
WHERE e.id = $2
AND e.course_id = c.id
AND c.module_id = m.id`;
exports.deleteExerciseById = "DELETE FROM exercises WHERE id = $1";
exports.updateExerciseById = "UPDATE exercises SET rights_template_id = $1, name = $2, description = $3 WHERE exercises.id = $4 RETURNING id, rights_template_id, name, description";

exports.getProjectsByExerciseId = "SELECT p.* FROM projects p, projects_rights($1) pr WHERE p.exercise_id = $2 AND p.id = pr.id AND pr.can_view";
exports.addProject = "INSERT INTO projects (exercise_id, author_id, projectgroup_id) VALUES ($1, $2, $3) RETURNING id, exercise_id, author_id, projectgroup_id";
exports.getProjectById = `SELECT
    id,
    exercise_id,
    author_id,
    can_view,
    can_edit,
    can_create_comment,
    can_create_visible_comment,
    can_delete,
    (SELECT COALESCE(json_agg(row_to_json(pg)) FILTER (WHERE pg.id IS NOT NULL), '[]') --Select projectgroup as json object
        FROM (
            SELECT
                projectgroup.id,
                (
                SELECT COALESCE(json_agg(row_to_json(u)) FILTER (WHERE u.id IS NOT NULL), '[]') --Select projectgroup users as json object
                    FROM (
                        SELECT
                            user_id AS id,
                                (
                                SELECT display_name
                                FROM users
                                WHERE users.id = projectgroup_users.user_id
                           )
                        FROM projectgroup_users
                        WHERE projectgroup_users.projectgroup_id = projectgroup.id
                    ) u
                ) AS        users
            FROM projectgroup
            WHERE projectgroup.id = p.id
        ) pg
    ) AS project_groups,
    (
    SELECT COALESCE(json_agg(row_to_json(f)) FILTER (WHERE f.id IS NOT NULL), '[]') --Select file as json object
        FROM (
            SELECT
                id,
                path
                FROM files
                WHERE files.project_id = p.id
        ) f
    ) AS files
FROM projects_rights($1) p
WHERE p.id = $2`;
exports.deleteProjectById = "DELETE FROM projects WHERE id = $1";
exports.updateProjectById = "UPDATE projects SET exercise_id = $1, projectgroup_id = $2 WHERE projects.id = $3 RETURNING id, exercise_id, author_id, projectgroup_id";
exports.addFile = "INSERT INTO files (project_id, path, content) VALUES ($1, $2, $3)";
exports.getFileById = `SELECT
    f.id,
    f.project_id,
    f.path,
    f.content
FROM files f WHERE f.id = $1`;
exports.getFileLengthByFileId = "SELECT array_length(content, 1) FROM files WHERE id = $1;";

exports.addComment = `
INSERT INTO comments (parent_id, file_id, line_range, content, author_id, visible, timestamp) 
SELECT $1, $2, $3, $4, $5, $6, $7
WHERE ($1::int IS NULL OR $2 = (SELECT file_id FROM comments WHERE id = $1));`;
exports.deleteComment = "UPDATE comments SET deleted = true WHERE comments.id = $1";
exports.updateComment = "UPDATE comments SET content = $1, visible = $2 WHERE id = $3 RETURNING id";
exports.updateCommentContent = "UPDATE comments SET content = $1 WHERE id = $2 RETURNING id";
exports.getComments = "SELECT * FROM comments_rights($1) WHERE can_view;"
    
exports.getCommentsByFileId = `WITH RECURSIVE recursivecomment AS (
    SELECT
        id,
        parent_id,
        file_id,
        line_range,
        c.deleted,
        CASE WHEN deleted IS true THEN 'deleted' ELSE content END AS content,
        author_id,
        c.author_name,
        visible,
        timestamp,
        can_view,
        can_edit,
        can_delete,
        can_toggle_visibility,
        ARRAY[]::TEXT[] AS children,
    0 as depth
        FROM comments_rights($1) c
        WHERE  parent_id is NULL and file_id = $2 AND can_view
        UNION ALL
        SELECT
            c.id,
            c.parent_id,
            c.file_id,
            c.line_range,
            c.deleted,
            CASE WHEN c.deleted IS true THEN 'deleted' ELSE c.content END AS content,
            c.author_id,
            c.author_name,
            c.visible,
            c.timestamp,
            c.can_view,
            c.can_edit,
            c.can_delete,
            c.can_toggle_visibility,
            ARRAY[]::TEXT[] AS children,
            depth +  1
        FROM comments_rights($1) c
	INNER JOIN recursivecomment rc ON c.parent_id = rc.id
	WHERE c.can_view
)               --Select all comments for a file id, this needs to be recursive to support replies on comments. These can be found in the children field.
SELECT * FROM recursivecomment`;
exports.getFileLengthByFileId = "SELECT array_length(content, 1) FROM files WHERE id = $1;";
exports.getTemplates = `SELECT 
    t.id,
    t.name,
    (SELECT COALESCE(json_agg(row_to_json(r)) FILTER (WHERE r.id IS NOT NULL), '[]')
        FROM (
            SELECT
                g.id,
                g.description,
                json_build_object   --Select all rights for a template as a json object containing booleans.
                (
                    'member', json_build_object(
                        'can_view', CASE WHEN tc.project_right::bit(1) | b'0' = b'1' THEN true ELSE false END,
                        'can_edit', CASE WHEN tc.project_right::bit(2) | b'01' = b'11' THEN true ELSE false END,
                        'can_create_comment', CASE WHEN tc.project_right::bit(3) | b'011' = b'111' THEN true ELSE false END,
                        'can_create_visible_comment', CASE WHEN tc.project_right::bit(4) | b'0111' = b'1111' THEN true ELSE false END,
                        'can_delete', CASE WHEN tc.project_right::bit(5) | b'01111' = b'11111' THEN true ELSE false END
                    ),
                    'other', json_build_object(
                        'can_view', CASE WHEN tc.project_right::bit(6) | b'011111' = b'111111' THEN true ELSE false END,
                        'can_edit', CASE WHEN tc.project_right::bit(7) | b'0111111' = b'1111111' THEN true ELSE false END,
                        'can_create_comment', CASE WHEN tc.project_right::bit(8) | b'01111111' = b'11111111' THEN true ELSE false END,
                        'can_create_visible_comment', CASE WHEN tc.project_right::bit(9) | b'011111111' = b'111111111' THEN true ELSE false END,
                        'can_delete', CASE WHEN tc.project_right::bit(10) | b'0111111111' = b'1111111111' THEN true ELSE false END
                    )
                ) AS project_rights,
                json_build_object
                (
                    'owner', json_build_object(
                        'can_view', CASE WHEN tc.comment_right::bit(1) | b'0' = b'1' THEN true ELSE false END,
                        'can_edit', CASE WHEN tc.comment_right::bit(2) | b'01' = b'11' THEN true ELSE false END,
                        'can_delete', CASE WHEN tc.comment_right::bit(3) | b'011' = b'111' THEN true ELSE false END,
                        'can_toggle_visibility', CASE WHEN tc.comment_right::bit(4) | b'0111' = b'1111' THEN true ELSE false END
                    ),
                    'member', json_build_object(
                        'can_view', CASE WHEN tc.comment_right::bit(5) | b'01111' = b'11111' THEN true ELSE false END,
                        'can_edit', CASE WHEN tc.comment_right::bit(6) | b'011111' = b'111111' THEN true ELSE false END,
                        'can_delete', CASE WHEN tc.comment_right::bit(7) | b'0111111' = b'1111111' THEN true ELSE false END,
                        'can_toggle_visibility', CASE WHEN tc.comment_right::bit(8) | b'01111111' = b'11111111' THEN true ELSE false END
                    ),
                    'other', json_build_object(
                        'can_view', CASE WHEN tc.comment_right::bit(9) | b'011111111' = b'111111111' THEN true ELSE false END,
                        'can_edit', CASE WHEN tc.comment_right::bit(10) | b'0111111111' = b'1111111111' THEN true ELSE false END,
                        'can_delete', CASE WHEN tc.comment_right::bit(11) | b'01111111111' = b'11111111111' THEN true ELSE false END,
                        'can_toggle_visibility', CASE WHEN tc.comment_right::bit(12) | b'011111111111' = b'111111111111' THEN true ELSE false END
                    )
                ) AS comment_rights
            FROM templates_content tc, groups g
            WHERE t.id = tc.template_id AND g.id = tc.group_id
            ORDER BY g.id
        ) r
    ) AS rights
FROM templates t`
exports.addTemplate = "INSERT INTO templates (name) VALUES ($1) RETURNING id";
exports.addTemplateContent = "INSERT INTO templates_content (template_id, group_id, project_right, comment_right) VALUES ";
exports.deleteTemplate = "DELETE FROM templates WHERE id = $1";
exports.updateTemplateById = `WITH new_values (template_id, group_id, project_right, comment_right) AS (
    VALUES 
        ($1::integer, $2::integer, $3::integer, $4::integer)
),                                                          --Update or insert a rights group.
upsert AS
(
    UPDATE templates_content tc
        SET project_right = nv.project_right,
            comment_right = nv.comment_right
        FROM new_values nv
        WHERE tc.template_id = nv.template_id AND tc.group_id = nv.group_id
        RETURNING tc.*
) 
INSERT INTO templates_content (template_id, group_id, project_right, comment_right)
SELECT template_id, group_id, project_right, comment_right
FROM new_values
WHERE NOT EXISTS (SELECT 1 
                  FROM upsert up 
                  WHERE up.template_id = new_values.template_id AND up.group_id = new_values.group_id)`

exports.getProjectRights = `SELECT 
json_build_object
    (
        'member_rights', json_build_object(                                                                               -- Return rights for members of the project
            'associated_projects', (SELECT COALESCE(array_agg(pid.id) FILTER (WHERE pid.id IS NOT NULL), '{}') FROM (SELECT p.id FROM projectgroup_users pu, projects p WHERE pu.user_id = $1 AND p.projectgroup_id = pu.projectgroup_id) pid),
            'can_view', CASE WHEN tc.project_right::bit(1) | b'0' = b'1' THEN true ELSE false END,
            'can_edit', CASE WHEN tc.project_right::bit(2) | b'01' = b'11' THEN true ELSE false END,
            'can_create_comment', CASE WHEN tc.project_right::bit(3) | b'011' = b'111' THEN true ELSE false END,
            'can_create_visible_comment', CASE WHEN tc.project_right::bit(4) | b'0111' = b'1111' THEN true ELSE false END,
            'can_delete', CASE WHEN tc.project_right::bit(5) | b'01111' = b'11111' THEN true ELSE false END
        ), 
        'other_rights', json_build_object(                                                                               -- If not a member of the project return other rights
            'can_view', CASE WHEN tc.project_right::bit(6) | b'011111' = b'111111' THEN true ELSE false END,
            'can_edit', CASE WHEN tc.project_right::bit(7) | b'0111111' = b'1111111' THEN true ELSE false END,
            'can_create_comment', CASE WHEN tc.project_right::bit(8) | b'01111111' = b'11111111' THEN true ELSE false END,
            'can_create_visible_comment', CASE WHEN tc.project_right::bit(9) | b'011111111' = b'111111111' THEN true ELSE false END,
            'can_delete', CASE WHEN tc.project_right::bit(10) | b'0111111111' = b'1111111111' THEN true ELSE false END
        )
    ) AS project_rights
FROM exercises e
LEFT JOIN module_users mu
    ON (mu.user_id = $1 
        AND mu.module_id = $2)
LEFT JOIN templates_content tc
    ON (tc.group_id = mu.group_id 
        AND tc.template_id = e.rights_template_id)
WHERE e.id = $3`;

exports.getCommentRights = `SELECT 
json_build_object
    (
	'comment_rights', CASE WHEN EXISTS (                                                                        
	    SELECT 1 FROM projects p, projectgroup_users pu WHERE p.id = $4 AND p.projectgroup_id = pu.projectgroup_id AND pu.user_id = $1
	) THEN json_build_object(                                                                                   -- Return rights for project group members
            'owner_rights', json_build_object(                                                                  -- Return rights for author of comment                
                'owned_comments', (SELECT COALESCE(array_agg(r.id) FILTER (WHERE r.id IS NOT NULL), '{}') FROM (SELECT id FROM comments WHERE author_id = $1) r),
                'can_view', CASE WHEN tc.comment_right::bit(1) | b'0' = b'1' THEN true ELSE false END,
                'can_edit', CASE WHEN tc.comment_right::bit(2) | b'01' = b'11' THEN true ELSE false END,
                'can_delete', CASE WHEN tc.comment_right::bit(3) | b'011' = b'111' THEN true ELSE false END,
                'can_toggle_visibility', CASE WHEN tc.comment_right::bit(4) | b'0111' = b'1111' THEN true ELSE false END
            ),                                                                                   
            'can_view', CASE WHEN tc.comment_right::bit(5) | b'01111' = b'11111' THEN true ELSE false END,
            'can_edit', CASE WHEN tc.comment_right::bit(6) | b'011111' = b'111111' THEN true ELSE false END,
            'can_delete', CASE WHEN tc.comment_right::bit(7) | b'0111111' = b'1111111' THEN true ELSE false END,
            'can_toggle_visibility', CASE WHEN tc.comment_right::bit(8) | b'01111111' = b'11111111' THEN true ELSE false END
        ) ELSE json_build_object(                                                                               -- Else return other rights
            'owner_rights', json_build_object(                                                                  -- Return rights for author of comment
                'owned_comments', (SELECT COALESCE(array_agg(r.id) FILTER (WHERE r.id IS NOT NULL), '{}') FROM (SELECT id FROM comments WHERE author_id = $1) r),
                'can_view', CASE WHEN tc.comment_right::bit(1) | b'0' = b'1' THEN true ELSE false END,
                'can_edit', CASE WHEN tc.comment_right::bit(2) | b'01' = b'11' THEN true ELSE false END,
                'can_delete', CASE WHEN tc.comment_right::bit(3) | b'011' = b'111' THEN true ELSE false END,
                'can_toggle_visibility', CASE WHEN tc.comment_right::bit(4) | b'0111' = b'1111' THEN true ELSE false END
            ),
            'can_view', CASE WHEN tc.comment_right::bit(9) | b'011111111' = b'111111111' THEN true ELSE false END,
            'can_edit', CASE WHEN tc.comment_right::bit(10) | b'0111111111' = b'1111111111' THEN true ELSE false END,
            'can_delete', CASE WHEN tc.comment_right::bit(11) | b'01111111111' = b'11111111111' THEN true ELSE false END,
            'can_toggle_visibility', CASE WHEN tc.comment_right::bit(12) | b'011111111111' = b'111111111111' THEN true ELSE false END
        ) END
    ) AS user_rights
FROM exercises e
LEFT JOIN module_users mu
    ON (mu.user_id = $1 
        AND mu.module_id = $2) 
LEFT JOIN templates_content tc
    ON (tc.group_id = mu.group_id 
        AND tc.template_id = e.rights_template_id)
WHERE e.id = $3`;

exports.getModuleRights = "SELECT (SELECT json_agg(row_to_json(mr)) FROM (SELECT id, can_view, can_edit FROM modules_rights($1)) mr) AS modules_rights";
