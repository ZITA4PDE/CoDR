--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.6
-- Dumped by pg_dump version 9.6.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

DROP EVENT TRIGGER IF EXISTS postgraphile_watch_drop;
DROP EVENT TRIGGER IF EXISTS postgraphile_watch_ddl;
SET search_path = public, pg_catalog;

ALTER TABLE IF EXISTS ONLY public.module_users DROP CONSTRAINT IF EXISTS fk_user_id;
ALTER TABLE IF EXISTS ONLY public.projectgroup_users DROP CONSTRAINT IF EXISTS fk_user_id;
ALTER TABLE IF EXISTS ONLY public.templates_content DROP CONSTRAINT IF EXISTS fk_template_id;
ALTER TABLE IF EXISTS ONLY public.exercises DROP CONSTRAINT IF EXISTS fk_rights_template_id;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS fk_projectgroup_id;
ALTER TABLE IF EXISTS ONLY public.projectgroup_users DROP CONSTRAINT IF EXISTS fk_projectgroup_id;
ALTER TABLE IF EXISTS ONLY public.files DROP CONSTRAINT IF EXISTS fk_project_id_id;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS fk_parent_id;
ALTER TABLE IF EXISTS ONLY public.projectgroup DROP CONSTRAINT IF EXISTS fk_module_id;
ALTER TABLE IF EXISTS ONLY public.module_users DROP CONSTRAINT IF EXISTS fk_module_id;
ALTER TABLE IF EXISTS ONLY public.courses DROP CONSTRAINT IF EXISTS fk_module_id;
ALTER TABLE IF EXISTS ONLY public.module_users DROP CONSTRAINT IF EXISTS fk_group_id;
ALTER TABLE IF EXISTS ONLY public.templates_content DROP CONSTRAINT IF EXISTS fk_group_id;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS fk_file_id;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS fk_exercise_id;
ALTER TABLE IF EXISTS ONLY public.exercises DROP CONSTRAINT IF EXISTS fk_course_id;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS fk_author_id;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.templates DROP CONSTRAINT IF EXISTS templates_pkey;
ALTER TABLE IF EXISTS ONLY public.templates_content DROP CONSTRAINT IF EXISTS templates_content_pkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_pkey;
ALTER TABLE IF EXISTS ONLY public.projectgroup_users DROP CONSTRAINT IF EXISTS projectgroup_users_pkey;
ALTER TABLE IF EXISTS ONLY public.projectgroup DROP CONSTRAINT IF EXISTS projectgroup_pkey;
ALTER TABLE IF EXISTS ONLY public.modules DROP CONSTRAINT IF EXISTS modules_pkey;
ALTER TABLE IF EXISTS ONLY public.module_users DROP CONSTRAINT IF EXISTS module_users_pkey;
ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_pkey;
ALTER TABLE IF EXISTS ONLY public.files DROP CONSTRAINT IF EXISTS files_pkey;
ALTER TABLE IF EXISTS ONLY public.exercises DROP CONSTRAINT IF EXISTS exercises_pkey;
ALTER TABLE IF EXISTS ONLY public.courses DROP CONSTRAINT IF EXISTS courses_pkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.templates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.projects ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.projectgroup ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.modules ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.groups ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.files ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.exercises ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.courses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.comments ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.templates_id_seq;
DROP TABLE IF EXISTS public.templates_content;
DROP TABLE IF EXISTS public.templates;
DROP SEQUENCE IF EXISTS public.projects_id_seq;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.projectgroup_users;
DROP SEQUENCE IF EXISTS public.projectgroup_id_seq;
DROP TABLE IF EXISTS public.projectgroup;
DROP SEQUENCE IF EXISTS public.modules_id_seq;
DROP TABLE IF EXISTS public.modules;
DROP TABLE IF EXISTS public.module_users;
DROP SEQUENCE IF EXISTS public.groups_id_seq;
DROP TABLE IF EXISTS public.groups;
DROP SEQUENCE IF EXISTS public.files_id_seq;
DROP TABLE IF EXISTS public.files;
DROP SEQUENCE IF EXISTS public.exercises_id_seq;
DROP TABLE IF EXISTS public.exercises;
DROP SEQUENCE IF EXISTS public.courses_id_seq;
DROP TABLE IF EXISTS public.courses;
DROP SEQUENCE IF EXISTS public.comments_id_seq;
DROP TABLE IF EXISTS public.comments;
DROP FUNCTION IF EXISTS public.projects_rights(uid integer);
DROP FUNCTION IF EXISTS public.modules_rights(uid integer);
DROP FUNCTION IF EXISTS public.comments_rights(uid integer);
DROP FUNCTION IF EXISTS public.checkbit(rights bit, b integer);
SET search_path = postgraphile_watch, pg_catalog;

DROP FUNCTION IF EXISTS postgraphile_watch.notify_watchers_drop();
DROP FUNCTION IF EXISTS postgraphile_watch.notify_watchers_ddl();
DROP EXTENSION IF EXISTS plpgsql;
DROP SCHEMA IF EXISTS public;
DROP SCHEMA IF EXISTS postgraphile_watch;
--
-- Name: postgraphile_watch; Type: SCHEMA; Schema: -; Owner: codrdb
--

CREATE SCHEMA postgraphile_watch;


ALTER SCHEMA postgraphile_watch OWNER TO codrdb;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = postgraphile_watch, pg_catalog;

--
-- Name: notify_watchers_ddl(); Type: FUNCTION; Schema: postgraphile_watch; Owner: codrdb
--

CREATE FUNCTION notify_watchers_ddl() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
begin
  perform pg_notify(
    'postgraphile_watch',
    json_build_object(
      'type',
      'ddl',
      'payload',
      (select json_agg(json_build_object('schema', schema_name, 'command', command_tag)) from pg_event_trigger_ddl_commands() as x)
    )::text
  );
end;
$$;


ALTER FUNCTION postgraphile_watch.notify_watchers_ddl() OWNER TO codrdb;

--
-- Name: notify_watchers_drop(); Type: FUNCTION; Schema: postgraphile_watch; Owner: codrdb
--

CREATE FUNCTION notify_watchers_drop() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
begin
  perform pg_notify(
    'postgraphile_watch',
    json_build_object(
      'type',
      'drop',
      'payload',
      (select json_agg(distinct x.schema_name) from pg_event_trigger_dropped_objects() as x)
    )::text
  );
end;
$$;


ALTER FUNCTION postgraphile_watch.notify_watchers_drop() OWNER TO codrdb;

SET search_path = public, pg_catalog;

--
-- Name: checkbit(bit, integer); Type: FUNCTION; Schema: public; Owner: codrdb
--

CREATE FUNCTION checkbit(rights bit, b integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN CASE WHEN (rights >> (b-1))::integer & 1 = 1 THEN TRUE ELSE FALSE END;
END
$$;


ALTER FUNCTION public.checkbit(rights bit, b integer) OWNER TO codrdb;

--
-- Name: comments_rights(integer); Type: FUNCTION; Schema: public; Owner: codrdb
--

CREATE FUNCTION comments_rights(uid integer) RETURNS TABLE(id integer, parent_id integer, file_id integer, line_range text, content text, author_id integer, visible boolean, "timestamp" bigint, deleted boolean, can_view boolean, can_edit boolean, can_delete boolean, can_toggle_visibility boolean)
    LANGUAGE sql
    AS $$
SELECT c.id, c.parent_id, c.file_id, 
c.line_range, c.content, c.author_id, c.visible,
c.timestamp, c.deleted,
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
(SELECT c.*, p.projectgroup_id,
cast(tc.comment_right >> 8 as bit(4)) as other, 
cast(tc.comment_right >> 4 as bit(4)) as member, 
tc.comment_right::bit(4) as owner
FROM 
comments c,
files f,
projects_rights(uid) p, 
exercises e,
courses co, 
modules m, 
module_users mu,
templates_content tc 
WHERE f.id = c.file_id
AND p.id = f.project_id
AND e.id = p.exercise_id 
AND co.id = e.course_id
AND m.id = co.module_id
AND mu.module_id = m.id
AND mu.user_id = uid
AND e.rights_template_id = tc.template_id
AND tc.group_id = mu.group_id) as c) as c
$$;


ALTER FUNCTION public.comments_rights(uid integer) OWNER TO codrdb;

--
-- Name: modules_rights(integer); Type: FUNCTION; Schema: public; Owner: codrdb
--

CREATE FUNCTION modules_rights(uid integer) RETURNS TABLE(id integer, name text, description text, can_view boolean, can_edit boolean)
    LANGUAGE sql
    AS $$
SELECT mod.id, mod.name, mod.description,
(CASE WHEN EXISTS (SELECT id FROM modules m, module_users mu WHERE mu.user_id = uid AND m.id = mu.module_id AND m.id=mod.id) THEN true ELSE (CASE WHEN EXISTS (SELECT * FROM users WHERE id = uid AND user_level = 0) THEN true ELSE FALSE END) END) as can_view,
(CASE WHEN EXISTS (SELECT * FROM module_users WHERE user_id = uid AND module_id=id AND group_id = 3) OR (SELECT user_level = 0 FROM users WHERE id = uid) THEN true ELSE false END) AS can_edit
FROM
modules mod
$$;


ALTER FUNCTION public.modules_rights(uid integer) OWNER TO codrdb;

--
-- Name: projects_rights(integer); Type: FUNCTION; Schema: public; Owner: codrdb
--

CREATE FUNCTION projects_rights(uid integer) RETURNS TABLE(id integer, exercise_id integer, author_id integer, projectgroup_id integer, can_view boolean, can_edit boolean, can_create_comment boolean, can_create_visible_comment boolean, can_delete boolean)
    LANGUAGE sql
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
projects p, 
exercises e,
courses c, 
modules m, 
module_users mu,
templates_content tc 
WHERE e.id = p.exercise_id 
AND c.id = e.course_id
AND m.id = c.module_id
AND mu.module_id = m.id
AND mu.user_id = uid
AND e.rights_template_id = tc.template_id
AND tc.group_id = mu.group_id) as p) as p
$$;


ALTER FUNCTION public.projects_rights(uid integer) OWNER TO codrdb;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: codrdb
--

CREATE TABLE comments (
    id integer NOT NULL,
    parent_id integer,
    file_id integer,
    line_range text,
    content text NOT NULL,
    author_id integer NOT NULL,
    visible boolean NOT NULL,
    "timestamp" bigint NOT NULL,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE comments OWNER TO codrdb;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: codrdb
--

CREATE SEQUENCE comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE comments_id_seq OWNER TO codrdb;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codrdb
--

ALTER SEQUENCE comments_id_seq OWNED BY comments.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: codrdb
--

CREATE TABLE courses (
    id integer NOT NULL,
    module_id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL
);


ALTER TABLE courses OWNER TO codrdb;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: codrdb
--

CREATE SEQUENCE courses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE courses_id_seq OWNER TO codrdb;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codrdb
--

ALTER SEQUENCE courses_id_seq OWNED BY courses.id;


--
-- Name: exercises; Type: TABLE; Schema: public; Owner: codrdb
--

CREATE TABLE exercises (
    id integer NOT NULL,
    course_id integer NOT NULL,
    rights_template_id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL
);


ALTER TABLE exercises OWNER TO codrdb;

--
-- Name: exercises_id_seq; Type: SEQUENCE; Schema: public; Owner: codrdb
--

CREATE SEQUENCE exercises_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE exercises_id_seq OWNER TO codrdb;

--
-- Name: exercises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codrdb
--

ALTER SEQUENCE exercises_id_seq OWNED BY exercises.id;


--
-- Name: files; Type: TABLE; Schema: public; Owner: codrdb
--

CREATE TABLE files (
    id integer NOT NULL,
    project_id integer NOT NULL,
    path text NOT NULL,
    content text[] NOT NULL
);


ALTER TABLE files OWNER TO codrdb;

--
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: codrdb
--

CREATE SEQUENCE files_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE files_id_seq OWNER TO codrdb;

--
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codrdb
--

ALTER SEQUENCE files_id_seq OWNED BY files.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: codrdb
--

CREATE TABLE groups (
    id integer NOT NULL,
    description text NOT NULL
);


ALTER TABLE groups OWNER TO codrdb;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: codrdb
--

CREATE SEQUENCE groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE groups_id_seq OWNER TO codrdb;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codrdb
--

ALTER SEQUENCE groups_id_seq OWNED BY groups.id;


--
-- Name: module_users; Type: TABLE; Schema: public; Owner: codrdb
--

CREATE TABLE module_users (
    module_id integer NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE module_users OWNER TO codrdb;

--
-- Name: modules; Type: TABLE; Schema: public; Owner: codrdb
--

CREATE TABLE modules (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL
);


ALTER TABLE modules OWNER TO codrdb;

--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: codrdb
--

CREATE SEQUENCE modules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE modules_id_seq OWNER TO codrdb;

--
-- Name: modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codrdb
--

ALTER SEQUENCE modules_id_seq OWNED BY modules.id;


--
-- Name: projectgroup; Type: TABLE; Schema: public; Owner: codrdb
--

CREATE TABLE projectgroup (
    id integer NOT NULL,
    module_id integer NOT NULL
);


ALTER TABLE projectgroup OWNER TO codrdb;

--
-- Name: projectgroup_id_seq; Type: SEQUENCE; Schema: public; Owner: codrdb
--

CREATE SEQUENCE projectgroup_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE projectgroup_id_seq OWNER TO codrdb;

--
-- Name: projectgroup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codrdb
--

ALTER SEQUENCE projectgroup_id_seq OWNED BY projectgroup.id;


--
-- Name: projectgroup_users; Type: TABLE; Schema: public; Owner: codrdb
--

CREATE TABLE projectgroup_users (
    projectgroup_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE projectgroup_users OWNER TO codrdb;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: codrdb
--

CREATE TABLE projects (
    id integer NOT NULL,
    exercise_id integer NOT NULL,
    author_id integer NOT NULL,
    projectgroup_id integer NOT NULL
);


ALTER TABLE projects OWNER TO codrdb;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: codrdb
--

CREATE SEQUENCE projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE projects_id_seq OWNER TO codrdb;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codrdb
--

ALTER SEQUENCE projects_id_seq OWNED BY projects.id;


--
-- Name: templates; Type: TABLE; Schema: public; Owner: codrdb
--

CREATE TABLE templates (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE templates OWNER TO codrdb;

--
-- Name: templates_content; Type: TABLE; Schema: public; Owner: codrdb
--

CREATE TABLE templates_content (
    template_id integer NOT NULL,
    group_id integer NOT NULL,
    project_right integer NOT NULL,
    comment_right integer NOT NULL
);


ALTER TABLE templates_content OWNER TO codrdb;

--
-- Name: templates_id_seq; Type: SEQUENCE; Schema: public; Owner: codrdb
--

CREATE SEQUENCE templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE templates_id_seq OWNER TO codrdb;

--
-- Name: templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codrdb
--

ALTER SEQUENCE templates_id_seq OWNED BY templates.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: codrdb
--

CREATE TABLE users (
    id integer NOT NULL,
    session_id text NOT NULL,
    user_level integer NOT NULL,
    display_name text NOT NULL
);


ALTER TABLE users OWNER TO codrdb;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: codrdb
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE users_id_seq OWNER TO codrdb;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: codrdb
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY comments ALTER COLUMN id SET DEFAULT nextval('comments_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY courses ALTER COLUMN id SET DEFAULT nextval('courses_id_seq'::regclass);


--
-- Name: exercises id; Type: DEFAULT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY exercises ALTER COLUMN id SET DEFAULT nextval('exercises_id_seq'::regclass);


--
-- Name: files id; Type: DEFAULT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY files ALTER COLUMN id SET DEFAULT nextval('files_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY groups ALTER COLUMN id SET DEFAULT nextval('groups_id_seq'::regclass);


--
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY modules ALTER COLUMN id SET DEFAULT nextval('modules_id_seq'::regclass);


--
-- Name: projectgroup id; Type: DEFAULT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY projectgroup ALTER COLUMN id SET DEFAULT nextval('projectgroup_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY projects ALTER COLUMN id SET DEFAULT nextval('projects_id_seq'::regclass);


--
-- Name: templates id; Type: DEFAULT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY templates ALTER COLUMN id SET DEFAULT nextval('templates_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: module_users module_users_pkey; Type: CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY module_users
    ADD CONSTRAINT module_users_pkey PRIMARY KEY (module_id, user_id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: projectgroup projectgroup_pkey; Type: CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY projectgroup
    ADD CONSTRAINT projectgroup_pkey PRIMARY KEY (id);


--
-- Name: projectgroup_users projectgroup_users_pkey; Type: CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY projectgroup_users
    ADD CONSTRAINT projectgroup_users_pkey PRIMARY KEY (projectgroup_id, user_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: templates_content templates_content_pkey; Type: CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY templates_content
    ADD CONSTRAINT templates_content_pkey PRIMARY KEY (template_id, group_id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: comments fk_author_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY comments
    ADD CONSTRAINT fk_author_id FOREIGN KEY (author_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exercises fk_course_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY exercises
    ADD CONSTRAINT fk_course_id FOREIGN KEY (course_id) REFERENCES courses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projects fk_exercise_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT fk_exercise_id FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments fk_file_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY comments
    ADD CONSTRAINT fk_file_id FOREIGN KEY (file_id) REFERENCES files(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: templates_content fk_group_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY templates_content
    ADD CONSTRAINT fk_group_id FOREIGN KEY (group_id) REFERENCES groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: module_users fk_group_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY module_users
    ADD CONSTRAINT fk_group_id FOREIGN KEY (group_id) REFERENCES groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: courses fk_module_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY courses
    ADD CONSTRAINT fk_module_id FOREIGN KEY (module_id) REFERENCES modules(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: module_users fk_module_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY module_users
    ADD CONSTRAINT fk_module_id FOREIGN KEY (module_id) REFERENCES modules(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projectgroup fk_module_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY projectgroup
    ADD CONSTRAINT fk_module_id FOREIGN KEY (module_id) REFERENCES modules(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments fk_parent_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY comments
    ADD CONSTRAINT fk_parent_id FOREIGN KEY (parent_id) REFERENCES comments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: files fk_project_id_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY files
    ADD CONSTRAINT fk_project_id_id FOREIGN KEY (project_id) REFERENCES projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projectgroup_users fk_projectgroup_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY projectgroup_users
    ADD CONSTRAINT fk_projectgroup_id FOREIGN KEY (projectgroup_id) REFERENCES projectgroup(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projects fk_projectgroup_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT fk_projectgroup_id FOREIGN KEY (projectgroup_id) REFERENCES projectgroup(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: exercises fk_rights_template_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY exercises
    ADD CONSTRAINT fk_rights_template_id FOREIGN KEY (rights_template_id) REFERENCES templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: templates_content fk_template_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY templates_content
    ADD CONSTRAINT fk_template_id FOREIGN KEY (template_id) REFERENCES templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projectgroup_users fk_user_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY projectgroup_users
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: module_users fk_user_id; Type: FK CONSTRAINT; Schema: public; Owner: codrdb
--

ALTER TABLE ONLY module_users
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: postgraphile_watch_ddl; Type: EVENT TRIGGER; Schema: -; Owner: codrdb
--

CREATE EVENT TRIGGER postgraphile_watch_ddl ON ddl_command_end
         WHEN TAG IN ('ALTER DOMAIN', 'ALTER FOREIGN TABLE', 'ALTER FUNCTION', 'ALTER SCHEMA', 'ALTER TABLE', 'ALTER TYPE', 'ALTER VIEW', 'COMMENT', 'CREATE DOMAIN', 'CREATE FOREIGN TABLE', 'CREATE FUNCTION', 'CREATE SCHEMA', 'CREATE TABLE', 'CREATE TABLE AS', 'CREATE VIEW', 'DROP DOMAIN', 'DROP FOREIGN TABLE', 'DROP FUNCTION', 'DROP SCHEMA', 'DROP TABLE', 'DROP VIEW', 'GRANT', 'REVOKE', 'SELECT INTO')
   EXECUTE PROCEDURE postgraphile_watch.notify_watchers_ddl();


ALTER EVENT TRIGGER postgraphile_watch_ddl OWNER TO codrdb;

--
-- Name: postgraphile_watch_drop; Type: EVENT TRIGGER; Schema: -; Owner: codrdb
--

CREATE EVENT TRIGGER postgraphile_watch_drop ON sql_drop
   EXECUTE PROCEDURE postgraphile_watch.notify_watchers_drop();


ALTER EVENT TRIGGER postgraphile_watch_drop OWNER TO codrdb;

--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

