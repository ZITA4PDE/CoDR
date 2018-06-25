DO $$
DECLARE template_id int;
BEGIN
INSERT INTO templates (name) VALUES ('Default') RETURNING id INTO template_id;

INSERT INTO groups (description) VALUES ('Students');
INSERT INTO groups (description) VALUES ('Teaching assistants');
INSERT INTO groups (description) VALUES ('Moderators');

INSERT INTO templates_content 
(template_id,group_id,project_right,comment_right)
VALUES
(template_id,1,B'0000011111'::integer,B'000000010111'::integer),
(template_id,2,B'0010111111'::integer,B'000100010111'::integer),
(template_id,3,B'1111111111'::integer,B'111111111111'::integer);
END $$;
