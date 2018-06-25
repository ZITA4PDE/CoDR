import React from 'react';
import ReactDOM from 'react-dom';
import {renderNav} from '../nav';
import config from '../config';
import {params_to_url, handleJSONResponse, getParams} from '../helpers';
import {SaveButton, MCForm, Modal, CreateButton, HeaderButton, Loader, ErrorDisplay, DeleteButton} from "../objects";
import {ProjectGroups} from "./projectgroup";

let params = getParams();

/**
 * Main module view
 */
class ModuleView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            error: null,
            module: null,
            form: null,
            //Currently active view
            active: 'courses',
            //Navigation items. These are coupled to views.
            navItems: {
                        courses: {
                            "text": "Courses"
                        },
                        projectgroup: {
                            "text": "Project groups"
                        },
                        settings: {
                            "text": "Settings"
                        },
                    }
        };

        this.componentDidMount = this.componentDidMount.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.updateForm = this.updateForm.bind(this);
        this.changeActive = this.changeActive.bind(this);
    }

    /**
     * Fetch module information
     */
    componentDidMount() {
        this.setState({isLoading: true});
        let {module_id} = params;
        let url = config.api + params_to_url(module_id);
        fetch(url, config.api_request)
            .then(handleJSONResponse)
            .then(json => {
                this.setState({
                    module: json,
                    isLoading: false,
                    postSuccess: null,
                });
            }).catch(e => {
            this.setState({error: new Error('while loading module'), isLoading: false})
        });
    }

    /**
     * Update navigation items if state changes
     */
    componentDidUpdate() {
        if (this.state.module) {
            let navItems = JSON.parse(JSON.stringify(this.state.navItems));
            if (!this.state.module.can_edit) {
                delete navItems.settings;
            }

            navItems[this.state.active].active = true;

            renderNav(navItems,this.changeActive);
        }
    }

    /**
     * Change the currently active view.
     * Called when button in sidebar is clicked.
     */
    changeActive(target) {
        this.setState({active: target});
    }

    /**
     * Update the form in the state.
     * Called when a field in the course creation form changes.
     */
    handleChange(e) {
        this.state.form[e.target.name] = parseInt(e.target.value);
    }

    /**
     * Send POST request to API
     * Called when course is created.
     */
    onFormSubmit(e) {
        e.preventDefault();
        let url = config.api + params_to_url(params.module_id);
        let request = config.api_put;
        request.body = JSON.stringify({
            users: [this.state.form],
        });

        fetch(url,request)
            .then(response => {
                if (response.ok) {
                    this.setState({postSuccess: true})
                } else {
                    throw new Error;
                }
            }).catch(e => {
                this.setState({postSuccess: false});
        })
    }

    /**
     * Set the initial form data in the state.
     * Called by AddUserForm.
     */
    updateForm(form) {
        if (!this.state.form) {
            this.state.form = form;
        }
    }

    /**
     * Render the currently active view
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

        let modalID = "addUser";

        //Create array of groups
        let groups = [];
        this.state.module.groups.forEach(group => {
            groups.push(<Group key={group.group_id} group={group}/>);
        });

        let userHeader = <h2>Groups and Users</h2>;
        if (this.state.module.can_edit) {
            userHeader = <HeaderButton main={userHeader} button={<CreateButton dataToggle={'modal'} dataTarget={modalID}/>}/>;
        }

        let postStatus = <h1>{this.state.postSuccess ? "User added successfully" : "Adding user failed"}</h1>;

        let tabs = {
            courses: <Courses refresh={this.componentDidMount} module={this.state.module}/>,
            settings: <div>
                        <h1>Settings</h1>
                        {userHeader}
                        {groups}
                        <form onSubmit={this.onFormSubmit}>
                            <Modal  id={modalID}
                                    header={
                                        <div className={"modal-header"}>
                                            <h1>Add user</h1>
                                        </div>
                                    }
                                    body={this.state.postSuccess === null ?
                                        <div className={"modal-body"}>
                                            <AddUserForm updateForm={this.updateForm} onChange={this.handleChange}/>
                                        </div>: postStatus}
                                    footer={
                                        <div className={"modal-footer"}>
                                            <button type="button"
                                                    className="btn btn-secondary"
                                                    data-dismiss="modal"
                                                    onClick={this.componentDidMount}>Close</button>
                                            {this.state.postSuccess === null ? <SaveButton submit/> : null}
                                        </div>}
                            />
                        </form>
                    </div>,
            projectgroup: <ProjectGroups params={params} groups={this.state.module.groups}/>,
        };

        return (
            <div>
                <div className={"jumbotron"}>
                    <h1>{this.state.module.name}</h1>
                    <p>{this.state.module.description}</p>
                </div>
                {tabs[this.state.active]}

            </div>
        )
    }
}

/**
 * Form to add a user to a module in a specified right group.
 */
class AddUserForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoadingUsers: true,
            isLoadingGroups: true,
            error: null,
            users: null,
            groups: null,
        }
    }

    /**
     * Fetch users and right groups from API.
     */
    componentDidMount() {
        this.setState({isLoadingGroups: true});
        this.setState({isLoadingUsers: true});
        let url = config.api + "/users";
        fetch(url,config.api_request)
            .then(handleJSONResponse)
            .then(json => {
                this.setState({isLoadingUsers: false,users: json});
            })
            .catch(e => {
                this.setState({error: new Error('Cannot load user list')});
            });

        url = config.api + "/right_groups";
        fetch(url, config.api_request)
            .then(handleJSONResponse)
            .then(json => {
                this.setState({isLoadingGroups: false, groups: json});
            })
            .catch(e => {
                this.setState({error: new Error('Cannot load groups list')});
            });
    }

    render() {
        if (this.state.error) {
            return <ErrorDisplay error={this.state.error}/>;
        }

        if (this.state.isLoadingUsers || this.state.isLoadingGroups) {
            return <Loader/>;
        }

        let form = {};

        //Create array of users to be used as options to the user selector.
        let optionsUsers = [];
        for (let i=0;i<this.state.users.length;i++) {
            let user=this.state.users[i];
            optionsUsers.push(<option key={user.id} value={user.id}>{user.display_name}</option>);
            //Set the first value as the initial value.
            if (i === 0) {
                form.user_id = user.id;
            }
        }

        //Create array of groups to be used as options to the group selector.
        let optionsGroups = [];
        for (let i=0;i<this.state.groups.length;i++) {
            let group=this.state.groups[i];
            optionsGroups.push(<option key={group.id} value={group.id}>{group.description}</option>);
            //Set the first value as the initial value
            if (i === 0) {
                form.group_id = group.id;
            }
        }

        //Set initial form in the state of the module.
        this.props.updateForm(form);

        return (
            <div className={"form-group"}>
                <label htmlFor={"user"}>User</label>
                <select className={"form-control"} name="user_id" onChange={this.props.onChange}>
                    {optionsUsers}
                </select>
                <label htmlFor={"group"}>Group</label>
                <select className={"form-control"} name="group_id" onChange={this.props.onChange}>
                    {optionsGroups}
                </select>
            </div>
        );
    }
}

/**
 * Rights group to be displayed with its users.
 */
class Group extends React.Component {
    render() {
        let {group} = this.props;

        //Create a list of users
        let users = [];
        group.users.forEach(user => {
            users.push(<p key={user.id}>{user.display_name}</p>);
        });

        return (
            <div>
                <h5>{group.description}</h5>
                {users}
            </div>
        )
    }
}

class Course extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            deleted: false,
        }
    }

    /**
     * Send DELETE request to the API to delete the course
     * Called when user clicks the delete button
     * @param {int} id - course id
     */
    deleteCourse(id) {
        let url = config.api + params_to_url(params.module_id,id);
        let request = config.api_delete;
        fetch(url,request)
            .then(response => {
                if (response.ok) {
                    alert('success');
                    this.setState({deleted:true})
                } else {
                    throw new Error();
                }
            }).catch(e => {
                alert('fail');
        })
    }

    render() {
        if (this.state.deleted) return null;
        let {can_edit,course} = this.props;
        let header = course.name;
        if (can_edit) {
            header = <HeaderButton main={header} button={<DeleteButton onClick={e => {
                e.stopPropagation();
                this.deleteCourse(course.id);
            }}/>}/>
        }
        return (
            <div id={course.id} className={"card top-margin clickable"} onClick={() => this.handleClick(course.id)}>
                <div className={"card-header"}>
                    {header}
                </div>
                <div className={"card-body"}>
                    {course.description}
                </div>
            </div>
        )
    }

    /**
     * Go to the course page
     * Called when user clicks on the course.
     * @param {int} course_id - id of the course that was clicked
     */
    handleClick(course_id) {
        window.location.href = config.website + params_to_url(params.module_id,course_id);
    }
}

/**
 * List of courses
 */
class Courses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            module: this.props.module,
            error: null,
            form: {},
            isPosting: false,
            postSuccess: null,
        };

        this.handleChange = this.handleChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
    }

    /**
     * Update the form in the state 
     * Called when a field in the create course form is changed.
     */
    handleChange(e) {
        this.state.form[e.target.name] = e.target.value;
        this.setState(this.state);
    }

    /**
     * Send POST request to the API
     * Called when user creates a course
     */
    onFormSubmit(e) {
        e.preventDefault();
        this.setState({isPosting: true});
        let {module_id} = params;
        let url = config.api + params_to_url(module_id) + "/courses";
        let request = config.api_post;
        request.body= JSON.stringify(this.state.form);
        fetch(url, request).then(response => {
            if (response.ok) {
                this.setState({postSuccess: true})
            } else {
                this.setState({postSuccess: false})
            }
        }).catch(e => {
            this.setState({isPosting: false});
        });
        this.setState({isPosting: false});
    }

    render() {
        if (this.state.error) {
            return (
                <ErrorDisplay error={this.state.error}/>
            );
        }
        let {module} = this.state;
        document.title = module.name;

        //Create a list of courses
        let courses = [];
        module.courses.forEach(course => {
            courses.push(<Course key={course.id} can_edit={module.can_edit} course={course}/>)
        });
        if (!courses.length) {
            courses = <p>There are no courses for this module.</p>;
        }

        let header =<h1>Courses</h1>;
        let modalID = "courseModal";

        if (module.can_edit) {
            header = <HeaderButton
                main={header} button={<CreateButton dataToggle={"modal"} dataTarget={modalID}/>}
            />
        }

        let postStatus = this.state.isPosting ? <Loader/> :
            <h1>{this.state.postSuccess ? "Course successfully created" : "Course creation failed"}</h1>;

        return (
            <div>
                {header}
                <div id="courses">
                    {courses}
                </div>
                {module.can_edit ?
                    <form id="courseCreateForm" onSubmit={this.onFormSubmit}>
                        <Modal  id={modalID}
                                header={
                                    <div className={"modal-header"}>
                                        <h1>Create Course</h1>
                                    </div>
                                }
                                body={
                                    this.state.postSuccess !== null ?
                                        postStatus
                                        : <div className={"modal-body"}>
                                        <MCForm onChange={this.handleChange}/>
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
                    </form>: null}
            </div>
        )
    }
}


ReactDOM.render(<ModuleView/>,document.getElementById('main-content'));
