DROP FUNCTION IF EXISTS checkbit(rights bit, b integer);
CREATE FUNCTION checkbit(rights bit, b integer) RETURNS boolean AS $$
BEGIN
RETURN CASE WHEN (rights >> (b-1))::integer & 1 = 1 THEN TRUE ELSE FALSE END;
END
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS projects_rights(uid integer);
CREATE FUNCTION projects_rights(uid integer) 
RETURNS TABLE(
id integer, 
exercise_id integer, 
author_id integer, 
projectgroup_id integer,
can_view boolean,
can_edit boolean,
can_create_comment boolean,
can_create_visible_comment boolean,
can_delete boolean) 
AS $$
SELECT p.id, p.exercise_id, p.author_id, p.projectgroup_id,  
checkbit(rights, 1) as can_view,
checkbit(rights, 2) as can_edit,
checkbit(rights, 3) as can_create_comment,
checkbit(rights, 4) as can_create_visible_comment,
checkbit(rights, 5) as can_delete
FROM
(SELECT p.*,  
    (CASE WHEN (SELECT (user_level = 0) FROM users WHERE users.id = uid) 
        THEN B'11111' 
        ELSE
            (CASE WHEN EXISTS (SELECT pu.user_id FROM projectgroup_users pu WHERE p.projectgroup_id = pu.projectgroup_id AND pu.user_id = uid) 
                THEN member 
                ELSE other 
            END)
    END) as rights
FROM
(SELECT p.*, 
cast(tc.project_right >> 5 as bit(5)) as other, 
tc.project_right::bit(5) as member
FROM 
projects p
INNER JOIN exercises e ON (e.id = p.exercise_id)
INNER JOIN courses c ON (c.id = e.course_id)
INNER JOIN modules m ON (m.id = c.module_id)
LEFT JOIN module_users mu 
    ON (m.id = mu.module_id 
        AND mu.user_id = uid)
LEFT JOIN templates_content tc 
    ON (tc.group_id = mu.group_id 
        AND tc.template_id = e.rights_template_id)
) as p) as p
$$ LANGUAGE SQL;

DROP FUNCTION IF EXISTS comments_rights(uid integer);
CREATE FUNCTION comments_rights(uid integer) 
RETURNS TABLE(
id integer,
parent_id integer,
file_id integer,
project_id integer,
exercise_id integer,
course_id integer,
module_id integer,
line_range text,
content text,
author_id integer,
author_name text,
visible boolean,
"timestamp" bigint,
deleted boolean,
can_view boolean,
can_edit boolean,
can_delete boolean,
can_toggle_visibility boolean
)
AS $$
SELECT c.id, c.parent_id, c.file_id, c.project_id, 
c.exercise_id, c.course_id, c.module_id, 
c.line_range, c.content, c.author_id, 
(SELECT u.display_name FROM users u WHERE u.id = c.author_id) as author_name, 
c.visible, c.timestamp, c.deleted, 
(c.visible OR c.can_toggle_visibility OR c.author_id = uid) AND c.can_view as can_view,
c.can_edit, c.can_delete, c.can_toggle_visibility
FROM
(SELECT c.*,
checkbit(rights, 1) as can_view,
checkbit(rights, 2) as can_edit,
checkbit(rights, 3) as can_delete,
checkbit(rights, 4) as can_toggle_visibility
FROM
(SELECT c.*,  
    (CASE WHEN (SELECT (user_level = 0) FROM users WHERE users.id = uid) 
        THEN B'1111' 
        ELSE
            ( CASE WHEN c.author_id = uid THEN owner 
            ELSE (CASE WHEN EXISTS 
                (SELECT pu.user_id 
                    FROM projectgroup_users pu 
                    WHERE projectgroup_id = pu.projectgroup_id 
                    AND pu.user_id = uid) THEN member 
            ELSE other END) 
            END)
    END) as rights
FROM
(SELECT c.*, 
    p.id as project_id, 
    e.id as exercise_id,
    co.id as course_id,
    m.id as module_id,
    p.projectgroup_id,
cast(tc.comment_right >> 8 as bit(4)) as other, 
cast(tc.comment_right >> 4 as bit(4)) as member, 
tc.comment_right::bit(4) as owner
FROM 
comments c
INNER JOIN files f ON (f.id = c.file_id)
INNER JOIN projects_rights(uid) p ON (p.id = f.project_id)
INNER JOIN exercises e ON (e.id = p.exercise_id)
INNER JOIN courses co ON (co.id = e.course_id)
INNER JOIN modules m ON (m.id = co.module_id)
LEFT JOIN module_users mu 
    ON (mu.module_id = m.id
        AND mu.user_id = uid)
LEFT JOIN templates_content tc 
    ON (e.rights_template_id = tc.template_id
        AND tc.group_id = mu.group_id)
) as c) as c) as c
ORDER BY c.timestamp DESC
$$ LANGUAGE SQL;

DROP FUNCTION IF EXISTS modules_rights(uid integer);
CREATE FUNCTION modules_rights(uid integer) 
RETURNS TABLE(
id integer,
name text,
description text,
can_view boolean,
can_edit boolean
)
AS $$
SELECT mod.id, mod.name, mod.description,
(CASE WHEN EXISTS (SELECT id FROM modules m, module_users mu WHERE mu.user_id = uid AND m.id = mu.module_id AND m.id=mod.id) THEN true ELSE (CASE WHEN EXISTS (SELECT * FROM users WHERE id = uid AND user_level = 0) THEN true ELSE FALSE END) END) as can_view,
(CASE WHEN EXISTS (SELECT * FROM module_users WHERE user_id = uid AND module_id=id AND group_id = 3) OR (SELECT user_level = 0 FROM users WHERE id = uid) THEN true ELSE false END) AS can_edit
FROM
modules mod
$$ LANGUAGE SQL;
