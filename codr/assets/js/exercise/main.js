import React from 'react';
import ReactDOM from 'react-dom';
import {renderNav} from '../nav';
import config from '../config';
import {Settings} from './settings.js';
import {params_to_url, handleJSONResponse, getParams, alertOnResponse} from '../helpers';
import {SaveButton, MCForm, Modal, CreateButton, HeaderButton, Loader, ErrorDisplay, DeleteButton} from "../objects";

let params = getParams();
let {module_id,course_id,exercise_id} = params;
let baseUrl = params_to_url(module_id,course_id,exercise_id);

let modalID = "createProject";

/**
 * Main view of an exercise
 */
class ExerciseView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            error: null,
            exercise: null,
            //Currently active view
            active: 'projects',
            //Navigation items. These are coupled with views.
            navItems: {
                projects: {
                    "text": "Projects"
                },
                settings: {
                    "text": "Settings"
                },
            }
        };

        this.componentDidMount = this.componentDidMount.bind(this);
        this.changeActive = this.changeActive.bind(this);
    }

    /**
     * Fetch exercise information.
     */
    componentDidMount() {
        let {module_id,course_id,exercise_id} = params;
        let url = config.api + params_to_url(module_id,course_id,exercise_id);
        fetch(url, config.api_request)
            .then(handleJSONResponse)
            .then(json => {
                this.setState({
                    exercise: json,
                    isLoading: false,
                    postSuccess: null,
                });
            }).catch(e => {
            this.setState({error: new Error('while loading exercise'), isLoading: false})
        });
    }

    /**
     * Update navigation items in the sidebar when exercise is updated
     */
    componentDidUpdate() {
        if (this.state.exercise) {
            let navItems = JSON.parse(JSON.stringify(this.state.navItems));
            if (!this.state.exercise.can_edit) {
                delete navItems.settings;
            }
            navItems[this.state.active].active = true;

            renderNav(navItems,this.changeActive);
        }
    }

    /**
     * Change the currently active view.
     * Called when button in the sidebar is clicked.
     */
    changeActive(target) {
        this.setState({active: target});
    }

    /**
     * Render the currently active view.
     */
    render() {
        if (this.state.isLoading) {
            return (
                <Loader/>
            )
        }
        if (this.state.error) {
            return <ErrorDisplay error={this.state.error}/>
        }

        let result = {
            projects: <Projects
                refresh={this.componentDidMount}
                exercise={this.state.exercise}/>,
            settings: <Settings
                refresh={this.componentDidMount}
                exercise={this.state.exercise}
                params={params}/>
        };

        return (
            <div>
                <div className={"jumbotron"}>
                    <h1>{this.state.exercise.name}</h1>
                    <p>{this.state.exercise.description}</p>
                </div>
                {result[this.state.active]}
            </div>
        )
    }
}

class Project extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            deleted: false,
        };
        this.deleteProject = this.deleteProject.bind(this);
    }

    /**
     * Send DELETE request to API
     * Called when user clicks the delete button.
     */
    deleteProject(id) {
        let url = config.api + params_to_url(params.module_id,params.course_id,params.exercise_id,id);
        fetch(url,config.api_delete)
            .then(response => {
                if (response.ok) {
                    alert('success');
                    this.setState({deleted: true});
                } else {
                    throw new Error();
                }
            })
            .catch(e => {
                alert('fail');
        })
    }

    render() {

        if (this.state.deleted) return null;

        let {project} = this.props;

        let {can_delete} = project;

        let {users} = project.projectgroup;

        let userString = '';

        for(let i=0;i<users.length;i++) {
            userString += users[i].display_name;
            if (users.length - i !== 1) {
                userString += ', ';
            }
        }

        let header = 'Project';
        if (can_delete) {
            header = <HeaderButton
                main={header}
                button={<DeleteButton onClick={e => {
                    e.stopPropagation();
                    this.deleteProject(project.id);
                }}/>}
            />
        }

        return (
            <div id={project.id} className={"card top-margin clickable"} onClick={() => this.handleClick(project.id)}>
                <div className={"card-header"}>
                    {header}
                </div>
                <div className={"card-body"}>
                    <h5>{config.strings.project_users}</h5>
                    {userString}
                </div>
            </div>
        )
    }

    /**
     * Go to project view when project  is clicked.
     * Called when user clicks on a project..
     * @param {int} project_id - id of the project that was clicked
     */
    handleClick(project_id) {
        window.location.href = config.website + params_to_url(params.module_id,params.course_id,params.exercise_id,project_id);
    }
}

/**
 * List of projects
 */
class Projects extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            error: null,
            form: null,
            isPosting: false,
            postSuccess: null,
            projectGroup: null,
        };

        this.handleChange = this.handleChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
    }

    /**
     * Fetch project information from API
     */
    componentDidMount() {
        let url = config.api + params_to_url(params.module_id) + '/group';
        fetch(url,config.api_request)
            .then(handleJSONResponse)
            .then(json => {
                this.setState({isLoading: false, projectGroups: json})
            }).catch(e => {
            this.setState({isLoading: false, error: new Error('while loading project groups')});
        })
    }

    /**
     * Update form data in the state.
     * Called when fields in the project creation form change.
     */
    handleChange(e) {
        this.setState({projectGroup: parseInt(e.target.value)});
    }

    /**
     * Send POST request to the API
     * Called when project is created
     */
    onFormSubmit(e) {
        e.preventDefault();
        this.setState({isPosting: true});
        let url = config.api + baseUrl + "/projects";
        let request = config.api_post;
        request.body= JSON.stringify({
            projectgroup_id: this.state.projectGroup,
        });
        fetch(url, request)
            .then(response => {
                if (response.ok) {
                    this.setState({postSuccess: true})
                } else {
                    throw new Error;
                }
            }).catch(e => {
            this.setState({postSuccess: false,isPosting: false});
        });
        this.setState({isPosting: false});
    }

    render() {

        if (this.state.isLoading) {
            return <Loader/>;
        }

        if (this.state.error) {
            return (
                <ErrorDisplay error={this.state.error}/>
            );
        }

        let {exercise} = this.props;
        document.title = exercise.name;
        //Create list of projects to be displayed
        let projects = [];
        exercise.projects.forEach(project => {
            projects.push(<Project key={project.id} project={project}/>)
        });
        if (!projects.length) {
            projects = <p>There are no projects for this exercise.</p>;
        }

        let header =<h1>Projects</h1>;

        header = <HeaderButton
            main={header} button={<CreateButton dataToggle={"modal"} dataTarget={modalID}/>}
        />;

        let postStatus = this.state.isPosting ? <Loader/> :
            <h1>{this.state.postSuccess ? "Project successfully created" : "Project creation failed"}</h1>;

        //Create list of projectgroups that can be used as the options to the projectgroup selector.
        let projectgroups = [];
        this.state.projectGroups.forEach(group => {
            let users = "";
            //Set a comma separated list of the users of the projectgroup as its name.
            for (let i=0;i<group.users.length;i++) {
                let user = group.users[i];
                users += user.display_name;
                if (i < group.users.length -1) {
                    users += ', ';
                }
            }

            projectgroups.push(
                <option key={group.group_id} value={group.group_id}>
                    {users}
                </option>
            );

            //Set the initial projectgroup value in the state.
            if (this.state.projectGroup === null) {
                this.state.projectGroup = group.group_id;
            }
        });

        return (
            <div>
                {header}
                <div id="projects">
                    {projects}
                </div>
                    <form id="projectCreateForm" onSubmit={this.onFormSubmit}>
                        <Modal  id={modalID}
                                header={
                                    <div className={"modal-header"}>
                                        <h1>Create Project</h1>
                                    </div>
                                }
                                body={
                                    this.state.postSuccess !== null ?
                                        postStatus
                                        : <div className={"modal-body"}>
                                            <select required className={"form-control"} onChange={this.handleChange} value={this.state.projectGroup}>
                                                {projectgroups}
                                            </select>
                                        </div>}
                                footer={
                                    <div className={"modal-footer"}>
                                        <button type="button"
                                                className="btn btn-secondary"
                                                data-dismiss="modal"
                                                onClick={this.props.refresh}>Close</button>
                                        {this.state.postSuccess === null ? <SaveButton submit/> : null}
                                    </div>}
                        />
                    </form>
            </div>
        )
    }
}


ReactDOM.render(<ExerciseView/>,document.getElementById('main-content'));
