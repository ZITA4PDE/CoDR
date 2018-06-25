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

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

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
    "timestamp" integer NOT NULL,
    deleted boolean NOT NULL
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
    id integer NOT NULL
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
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: codrdb
--

COPY comments (id, parent_id, file_id, line_range, content, author_id, visible, "timestamp") FROM stdin;
\.


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codrdb
--

SELECT pg_catalog.setval('comments_id_seq', 11, true);


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: codrdb
--

COPY courses (id, module_id, name, description) FROM stdin;
1	1	Pearl 000 - Black Pearl (Computer Architecture)	After absorbing the pearl “Computer Architecture”\n• The student can work with binary and hexadecimal number representations, binary logic and boolean algebra.\n• The student knows the basic architecture of a computer and its concepts register, memory, address, ALU, clock, program, program counter, instruction and mnemonic.\n• The student can write simple programs for a microcomputer in machine language using arithmetic, I/O, and (conditional) jump instructions.
2	1	Pearl 001 - Blue Pearl (Algoritmics)	After absorbing the pearl “Algoritmics”\n• The student can explain the importance of searching and sorting algorithms;\n• The student can explain the principle of and differences between linear and binary search methods, as well as between bubble sort and merge sort;\n• The student understands the complexity arguments behind the aforementioned algorithms and can analyse which is the best solution in what context;\n• The student can apply simple imperative programming concepts: if/then, while, integer variables and arrays;\n• The student can program the above algorithms in Python.
3	1	Pearl 010 - Green Pearl (Databases)	After absorbing the pearl “Databases”\n• The student knows the basic concepts of databases\n• The student can design a databaseschema for a simple case using ER-modeling.\n• The student can realize such a design in a relational DBMS using SQL.\n• The student can query and update a relational DBMS with SQL.
4	1	Pearl 011 - Cyan Pearl (Functional Programming)	After absorbing the pearl “Functional Programming”\n• The student knows the basic concepts of the chosen functional language,\n• The student is able to explain the concept of function application,\n• The student understands the principles of recursion and their relationship with induction,\n• The student is able to express simple algorithms in the chosen functional language.
5	2	Academic Skills	Concerning Academic Skills, after successfully finishing this module a student is capable of:\nDescribing the major principles of effective time management.\nApplying these principles to make a personal planning for a medium long term period, e.g., a study semester, and for a medium-sized project.\nFormulating personal strengths and weaknesses with regard to time management, study behaviour and project work.\nDescribing the major principles for defining a general project planning.\nApplying these principles when reflecting on some previous project planning.\nGiving and receiving peer feedback.\nIdentifying major personal pitfalls concerning procrastination behaviour.
6	2	Mathematics	Concerning Mathematics, after successfully finishing this module a student is capable of:\nWorking with limits and the definitions of continuity and differentiability and applications.\nInvestigating functions in two variables.\nWorking with elementary properties of integrals and calculate integrals using different techniques.\nWorking with power series and Taylor series.
7	2	Programming	Concerning Programming, after successfully finishing this module a student is capable of:\nExplaining and applying the core concepts of imperative programming, such as variables, data types, structured programming statements, recursion, lists, arrays, methods, parameters, and exceptions.\nExplaining and applying the core concepts of object-orientation, such as object, class, value, type, object reference, interface, specialisation / inheritance, and composition.\nUsing the Model/View/Controller pattern when developing applications.\nWriting simple multi-threaded programs, and explaining the operation and problems (race-conditions) of concurrent threads, and using synchronisation mechanisms, such as monitors, locks and wait  sets.\nWriting programs using basic network mechanisms, based on sockets.\nExplaining and applying the basic concepts of security engineering and applying them to Java programs.\nWriting software of average size (around ten classes) in Java,by using the concepts mentioned above, including the use ofalgorithms for searching and sorting data\nDocumenting software of this size, by using (informal)preconditions, postconditions and (class) invariants, and (informally) justifying the correctness of the implemented software.\nExplaining how this software can be tested, defining and executing a test plan, and measuring and improving test coverage. 
8	2	Software Design	Concerning Software Design, after successfully finishing this module a student is capable of:\nSpecifying an existing software system or a software system under design in terms of UML models (including class diagrams, activity diagrams and state machines).\nInterpreting these models, explaining the relation between different models, and between each model and the software code, and the usefulness of defining models in addition to writing software code.\nExplaining the commonly recognised phases of software development\nApplying version management in software development projects\nExplaining basic software metrics and using them to assess quality characteristics of a code base 
9	3	Mathematics	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar odio neque, nec mattis nisi condimentum nec. Duis a nisi vel mi faucibus finibus nec et ligula. Etiam justo nulla, pharetra id vestibulum vel, molestie vel est. Maecenas arcu magna, malesuada quis lorem quis, semper vestibulum diam. Nam nec mauris at sem vehicula mollis vehicula vitae tortor. Maecenas finibus tristique velit, ac scelerisque ex. Suspendisse id egestas nibh. Vivamus id congue nisl. Duis sagittis, elit nec maximus ornare, nisl massa accumsan erat, non faucibus tellus mauris pellentesque nulla.
10	3	Academic Skills	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar odio neque, nec mattis nisi condimentum nec. Duis a nisi vel mi faucibus finibus nec et ligula. Etiam justo nulla, pharetra id vestibulum vel, molestie vel est. Maecenas arcu magna, malesuada quis lorem quis, semper vestibulum diam. Nam nec mauris at sem vehicula mollis vehicula vitae tortor. Maecenas finibus tristique velit, ac scelerisque ex. Suspendisse id egestas nibh. Vivamus id congue nisl. Duis sagittis, elit nec maximus ornare, nisl massa accumsan erat, non faucibus tellus mauris pellentesque nulla.
11	3	Network Systems	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar odio neque, nec mattis nisi condimentum nec. Duis a nisi vel mi faucibus finibus nec et ligula. Etiam justo nulla, pharetra id vestibulum vel, molestie vel est. Maecenas arcu magna, malesuada quis lorem quis, semper vestibulum diam. Nam nec mauris at sem vehicula mollis vehicula vitae tortor. Maecenas finibus tristique velit, ac scelerisque ex. Suspendisse id egestas nibh. Vivamus id congue nisl. Duis sagittis, elit nec maximus ornare, nisl massa accumsan erat, non faucibus tellus mauris pellentesque nulla.
12	4	Probability Theory	M1.    …explain and apply the use of elementary probability theory, such as combinatoric probability theory, conditional probability, independence;\nM2.    …explain and apply probability distributions of one or more random variables, (discrete) conditional probabilities, and compute expectation, variance, and correlation coefficient;\nM3.    …explain and apply basic discrete and continuous distributions, including binomial, geometric, Poisson, uniform, exponential and normal distributions.
13	4	Web Programming	P1.    …design and implement complex multi-tier web applications;\nP2.    …use repositories and version management;\nP3.    …integrate web applications with existing (REST-ful) services;\nP4.    …build user interfaces with frameworks for HTML, CSS, and javascript;\nP5.    …explain the consequences of server-side vs. client-side scripting, servlets, Ajax, JSP, Web frameworks, etc.;
14	4	Requirements Engineering	R1.    …identify business requirements and translate these to user stories;\nR2.    …specify functional and non-functional requirements;\nR3.    …prioritize requirements in collaboration with various stakeholders;\nR4.    …design a UML class diagram;\nR5.     …systematically design web based applications using UML;
15	5	Computer Architecture and Organisation	The architecture and organisation of computer systems are presented. Computer organisation deals with elementary knowledge and skills, required for designing digital systems. Furthermore, basic principles of components of a processor (CPU) are discussed as well as their relation. The processor is analysed based on the separation into a data- and control path. The operation and the structure of these paths will be discussed as well as the cooperation of the different components (e.g. the ALU, registers and busses). Besides that, attention will be paid to microprogramming (the basic principles are explained on the basis of different types of CPU’s) and to the Instruction Set Architecture (ISA), the link between software and hardware. Computer architecture concentrates on the processor and its environment. Students are taught the subsystems of which a computer system is constructed, how these subsystems behave and how they, together, determine the behaviour of the overall computer system. The design of elements within the memory hierarchy and I/O modules will be elaborated.
16	5	Operating Systems	An operating system is a resource manager; it basically ensures that all users get their fair share of the resources. The focus is on generic operating system concepts with illustrative examples from Linux wherever appropriate. Topics covered include the structure of the operating system, processes and threads, concurrency, deadlock and starvation, memory management, I/O management and file systems, access control, threats, protection and security. Students will be using mainly C and some Java.
17	5	ICT and Law	Computer scientists that have successfully finalized this course are capable of timely signalling the relevant IT-juridical aspects of their work and to fulfil their task to communicate on these aspects with legal professionals. As a first introduction into ICT and Law, focus is on three themes: legal protection of software (copyright, database right), protection of personal data (privacy law) and computer crime (criminal law).
18	6	Artificial Intelligence	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar odio neque, nec mattis nisi condimentum nec. Duis a nisi vel mi faucibus finibus nec et ligula. Etiam justo nulla, pharetra id vestibulum vel, molestie vel est. Maecenas arcu magna, malesuada quis lorem quis, semper vestibulum diam. Nam nec mauris at sem vehicula mollis vehicula vitae tortor. Maecenas finibus tristique velit, ac scelerisque ex. Suspendisse id egestas nibh. Vivamus id congue nisl. Duis sagittis, elit nec maximus ornare, nisl massa accumsan erat, non faucibus tellus mauris pellentesque nulla.
19	6	Statistical Techniques	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar odio neque, nec mattis nisi condimentum nec. Duis a nisi vel mi faucibus finibus nec et ligula. Etiam justo nulla, pharetra id vestibulum vel, molestie vel est. Maecenas arcu magna, malesuada quis lorem quis, semper vestibulum diam. Nam nec mauris at sem vehicula mollis vehicula vitae tortor. Maecenas finibus tristique velit, ac scelerisque ex. Suspendisse id egestas nibh. Vivamus id congue nisl. Duis sagittis, elit nec maximus ornare, nisl massa accumsan erat, non faucibus tellus mauris pellentesque nulla.
20	6	Human Computer Interaction	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar odio neque, nec mattis nisi condimentum nec. Duis a nisi vel mi faucibus finibus nec et ligula. Etiam justo nulla, pharetra id vestibulum vel, molestie vel est. Maecenas arcu magna, malesuada quis lorem quis, semper vestibulum diam. Nam nec mauris at sem vehicula mollis vehicula vitae tortor. Maecenas finibus tristique velit, ac scelerisque ex. Suspendisse id egestas nibh. Vivamus id congue nisl. Duis sagittis, elit nec maximus ornare, nisl massa accumsan erat, non faucibus tellus mauris pellentesque nulla.
21	7	Discrete Structures & Algorithms	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar odio neque, nec mattis nisi condimentum nec. Duis a nisi vel mi faucibus finibus nec et ligula. Etiam justo nulla, pharetra id vestibulum vel, molestie vel est. Maecenas arcu magna, malesuada quis lorem quis, semper vestibulum diam. Nam nec mauris at sem vehicula mollis vehicula vitae tortor. Maecenas finibus tristique velit, ac scelerisque ex. Suspendisse id egestas nibh. Vivamus id congue nisl. Duis sagittis, elit nec maximus ornare, nisl massa accumsan erat, non faucibus tellus mauris pellentesque nulla.
22	7	Algebra & Finite Automata	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar odio neque, nec mattis nisi condimentum nec. Duis a nisi vel mi faucibus finibus nec et ligula. Etiam justo nulla, pharetra id vestibulum vel, molestie vel est. Maecenas arcu magna, malesuada quis lorem quis, semper vestibulum diam. Nam nec mauris at sem vehicula mollis vehicula vitae tortor. Maecenas finibus tristique velit, ac scelerisque ex. Suspendisse id egestas nibh. Vivamus id congue nisl. Duis sagittis, elit nec maximus ornare, nisl massa accumsan erat, non faucibus tellus mauris pellentesque nulla.
23	7	Research Project Graph Isomorphism	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar odio neque, nec mattis nisi condimentum nec. Duis a nisi vel mi faucibus finibus nec et ligula. Etiam justo nulla, pharetra id vestibulum vel, molestie vel est. Maecenas arcu magna, malesuada quis lorem quis, semper vestibulum diam. Nam nec mauris at sem vehicula mollis vehicula vitae tortor. Maecenas finibus tristique velit, ac scelerisque ex. Suspendisse id egestas nibh. Vivamus id congue nisl. Duis sagittis, elit nec maximus ornare, nisl massa accumsan erat, non faucibus tellus mauris pellentesque nulla.
24	8	Functional Programming	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar odio neque, nec mattis nisi condimentum nec. Duis a nisi vel mi faucibus finibus nec et ligula. Etiam justo nulla, pharetra id vestibulum vel, molestie vel est. Maecenas arcu magna, malesuada quis lorem quis, semper vestibulum diam. Nam nec mauris at sem vehicula mollis vehicula vitae tortor. Maecenas finibus tristique velit, ac scelerisque ex. Suspendisse id egestas nibh. Vivamus id congue nisl. Duis sagittis, elit nec maximus ornare, nisl massa accumsan erat, non faucibus tellus mauris pellentesque nulla.
25	8	Logic Programming	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar odio neque, nec mattis nisi condimentum nec. Duis a nisi vel mi faucibus finibus nec et ligula. Etiam justo nulla, pharetra id vestibulum vel, molestie vel est. Maecenas arcu magna, malesuada quis lorem quis, semper vestibulum diam. Nam nec mauris at sem vehicula mollis vehicula vitae tortor. Maecenas finibus tristique velit, ac scelerisque ex. Suspendisse id egestas nibh. Vivamus id congue nisl. Duis sagittis, elit nec maximus ornare, nisl massa accumsan erat, non faucibus tellus mauris pellentesque nulla.
26	8	Compiler Construction	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar odio neque, nec mattis nisi condimentum nec. Duis a nisi vel mi faucibus finibus nec et ligula. Etiam justo nulla, pharetra id vestibulum vel, molestie vel est. Maecenas arcu magna, malesuada quis lorem quis, semper vestibulum diam. Nam nec mauris at sem vehicula mollis vehicula vitae tortor. Maecenas finibus tristique velit, ac scelerisque ex. Suspendisse id egestas nibh. Vivamus id congue nisl. Duis sagittis, elit nec maximus ornare, nisl massa accumsan erat, non faucibus tellus mauris pellentesque nulla.
27	8	Concurrent Programming	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas pulvinar odio neque, nec mattis nisi condimentum nec. Duis a nisi vel mi faucibus finibus nec et ligula. Etiam justo nulla, pharetra id vestibulum vel, molestie vel est. Maecenas arcu magna, malesuada quis lorem quis, semper vestibulum diam. Nam nec mauris at sem vehicula mollis vehicula vitae tortor. Maecenas finibus tristique velit, ac scelerisque ex. Suspendisse id egestas nibh. Vivamus id congue nisl. Duis sagittis, elit nec maximus ornare, nisl massa accumsan erat, non faucibus tellus mauris pellentesque nulla.
\.


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codrdb
--

SELECT pg_catalog.setval('courses_id_seq', 27, true);


--
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: codrdb
--

COPY exercises (id, course_id, rights_template_id, name, description) FROM stdin;
1	1	1	Programming Exercise	A programming exercise for novice programmers.
2	2	1	Mathematics Tutorial	Show that P is equal to NP.
3	3	3	Programming Tutorial 3	Upload your solutions for the third programming tutorial here.
4	4	2	Programming Tutorial Homework	Upload your solutions to this week's programming tutorial here.
\.


--
-- Name: exercises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codrdb
--

SELECT pg_catalog.setval('exercises_id_seq', 4, true);


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: codrdb
--

COPY files (id, project_id, path, content) FROM stdin;
\.


--
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codrdb
--

SELECT pg_catalog.setval('files_id_seq', 41, true);


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: codrdb
--

COPY groups (id, description) FROM stdin;
1	Students
2	Teaching Assistants
3	Moderators
\.


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codrdb
--

SELECT pg_catalog.setval('groups_id_seq', 1, true);


--
-- Data for Name: module_users; Type: TABLE DATA; Schema: public; Owner: codrdb
--

COPY module_users (module_id, user_id, group_id) FROM stdin;
1	1	1
1	2	1
1	3	2
1	4	2
1	5	3
2	1	1
2	2	2
2	3	1
2	4	2
2	5	3
3	1	1
3	2	1
3	3	1
3	4	1
3	5	3
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: codrdb
--

COPY modules (id, name, description) FROM stdin;
1	The Pearls of Computer Science	In this module you will learn about seven ‘pearls’ of technical computer science, which will allow you to see how vast this subject is. The module deals with computer architecture, programming algorithms, encrypting information, developing software, the Internet as a computer network, functional programming and artificial intelligence. For this module's project, you and your project team will produce a system that automatically analyses and visualizes Tweets.\n
2	Software Systems	In the Software System module, you will learn how to design and build software, from analysing the requirements to delivering a working programme. For the final project, you will programme a multi-player game according to a fixed structure.
3	Network Systems	During the third module you will learn about computer networks. A good example of these networks is the Internet. How does this kind of network operate? In this module you will learn more about how information is sent and received in small packages, through cables or a wireless system, how the best path through a network is found and how you can prevent the packages from getting damaged or lost on the way. After that, it will be time to learn about a network's application, protection against abuse and the scalability of large networks. Various challenging assignments will help you absorb the knowledge you need.
4	Data & Information	In the last module of the first year, you will learn how to place relevant business information in a database. You will become familiar with data management concepts and relational databases. In this module you will also work on developing software using an approach that is quite common in the business world: Agile software engineering. In two-week ‘sprints’, you will work on delivering the software and in so-called ‘scrum sessions’ you will discuss with fellow students what you have been doing, what your plans are and what problems you are coming up against. It is a great way of learning how to work on software as a team and in a structured way.
5	Computer Systems	In this module you will learn how to realize digital circuits using Boolean algebra. With the help of these digital circuits you can develop the basic building blocks for a computer, such as adders and multipliers. You will learn about building standard processors according to the Von Neumann principle and also about Instruction Set Architecture (ISA), which allows you to programme these processes using a programming language. In this module you will programme ‘close to the hardware’. You will also learn how operating systems are built and how they work.
6	Intelligent Interaction Design	This module is about designing, realizing and evaluating interaction between people and technical systems. In your project, you will work in a multidisciplinary team with members from our Technical Computer Science, Business & IT and Creative Technology programmes. Your goal as a team will be to design an interactive – and possibly intelligent – system and to evaluate it with potential users. In addition to the team project, this muddle includes lectures, instructions and self-study. You will learn about statistics and get familiar with methods for conducting user studies. Quantitative and qualitative methods for analysing the resulting data are also on the menu. In the artificial intelligence part of the module, you will learn and apply various techniques for modelling intelligent system behaviour. Learning to reflect on scientific research in relation to the design and development of technology is also a part of the programme.
7	Discrete Structures & Efficient Algorithms	In this module you will grow familiar with mathematical structures, such as graphs, networks and languages, as well as basic algebraic structures, such as groups and fields. The focus will be on algorithmic questions connected to these discrete structures. This means data structures, formal languages and models for computation will be on the menu, too. 
8	Programming Paradigms	The standard style of programming follows the imperative paradigm: you tell the computer what it has to do step-by-step. But there are also some surprising alternatives to this, like the functional and logical paradigm. These are stronger and better suited for certain purposes. In this module, you will not only learn about these alternatives, you will also get a broader view and understanding of other programming language concepts, such as typification and semantics.
\.


--
-- Name: modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codrdb
--

SELECT pg_catalog.setval('modules_id_seq', 10, true);


--
-- Data for Name: projectgroup; Type: TABLE DATA; Schema: public; Owner: codrdb
--

COPY projectgroup (id) FROM stdin;
1
2
3
4
5
6
7
8
\.


--
-- Name: projectgroup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codrdb
--

SELECT pg_catalog.setval('projectgroup_id_seq', 8, true);


--
-- Data for Name: projectgroup_users; Type: TABLE DATA; Schema: public; Owner: codrdb
--

COPY projectgroup_users (projectgroup_id, user_id) FROM stdin;
1	1
1	2
2	3
2	4
3	1
3	4
4	1
4	4
5	1
5	2
5	3
6	2
7	4
7	1
8	3
8	4
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: codrdb
--

COPY projects (id, exercise_id, author_id, projectgroup_id) FROM stdin;
1	1	1	3
2	1	2	1
3	2	4	3
4	2	1	6
5	3	4	8
6	3	5	2
7	3	5	7
8	4	3	5
9	4	2	6
10	4	3	7
\.


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codrdb
--

SELECT pg_catalog.setval('projects_id_seq', 10, true);


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: codrdb
--

COPY templates (id, name) FROM stdin;
1	Moderators have full rights
2	Only group members have full rights
3	Group members have full rights, non-members can view
\.


--
-- Data for Name: templates_content; Type: TABLE DATA; Schema: public; Owner: codrdb
--

COPY templates_content (template_id, group_id, project_right, comment_right) FROM stdin;
1	3	1023	4095
2	1	31	2190
3	1	543	2303
\.


--
-- Name: templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codrdb
--

SELECT pg_catalog.setval('templates_id_seq', 1, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: codrdb
--

COPY users (id, session_id, user_level, display_name) FROM stdin;
1	1	1	Joost Prins
2	2	2	Jan-Jaap Korpershoek
3	3	3	Noël Keijzer
4	4	4	Tom Leemreize
5	5	5	Henk de Boer
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codrdb
--

SELECT pg_catalog.setval('users_id_seq', 7, true);


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
    ADD CONSTRAINT templates_content_pkey PRIMARY KEY (template_id,group_id);


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
-- PostgreSQL database dump complete
--

