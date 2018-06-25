import React from 'react';
import * as config from "../config";
import {handleJSONResponse, params_to_url, getCookie} from "../helpers";
import {
    CloseButton,
    CreateButton,
    DeleteButton,
    ErrorDisplay,
    HeaderButton,
    Loader,
    Modal,
    SaveButton
} from "../objects";

/**
 * View to manipulate project groups
 */
export class ProjectGroups extends React.Component {
    constructor(props) {
        super(props);

        //Create a list of all users in the module.
        let users = [];
        props.groups.forEach(group => {
            group.users.forEach(user => {
                users.push(user);
            })
        });

        this.state = {
            projectGroups: null,
            isLoading: true,
            params: props.params,
            users: users,
            //Currently active project group
            active: 0,
        };
        this.componentDidMount = this.componentDidMount.bind(this);
        this.changeGroup = this.changeGroup.bind(this);
        this.createProjectGroup = this.createProjectGroup.bind(this);
    }

    /**
     * Fetch project groups from API
     */
    componentDidMount() {
        let {params} = this.state;
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
     * Change the active project group
     * Called when project group selector is changed.
     */
    changeGroup(e) {
        this.setState({active: parseInt(e.target.value)});
    }

    /**
     * Send POST request to the API
     * Called when a project group is created by user.
     */
    createProjectGroup() {
        let url = config.api + '/groups';
        let request = config.api_post;
        request.body = JSON.stringify({
            module_id: parseInt(this.props.params.module_id),
        });
        fetch(url,request)
            .then(response => {
                if (response.ok) {
                    alert('success');
                    this.componentDidMount();
                } else {
                    throw new Error();
                }
            }).catch(e => {
                alert('fail');
        });
    }

    render() {
        if (this.state.isLoading) {
            return <Loader/>;
        }

        if (this.state.error) {
            return <ErrorDisplay error={this.state.error}/>;
        }

        //Create list of project groups to be used as options to the project group selector
        let projectgroups = [];
        this.state.projectGroups.forEach((group,index) => {
            let users = "";
            for (let i=0;i<group.users.length;i++) {
                //Create comma separated list of users to be used as the name of a project group
                let user = group.users[i];
                users += user.display_name;
                if (i < group.users.length -1) {
                    users += ', ';
                }
            }
            projectgroups.push(
                <option key={index} value={index}>
                    {users}
                </option>
            )
        });

        return (
            <div>
                <div className={"form-inline"}>
                    <label className={"form-control"}>Select a project group</label>
                    <select className={"form-control"} onChange={this.changeGroup}>
                        {projectgroups}
                    </select>
                    <div className={"form-control"}>
                        <CreateButton onClick={this.createProjectGroup}/>
                    </div>
                    <div className={'form-control d-none'}>
                        <DeleteButton big onClick={this.deleteProjectGroup}/>
                    </div>
                </div>
                {projectgroups.length > 0 ?
                    <ProjectGroup
                        refresh={this.componentDidMount}
                        users={this.state.users}
                        projectGroup={this.state.projectGroups[this.state.active]}/>
                    : config.no_projectgroups}
            </div>
        )
    }
}

class ProjectGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projectGroup: props.projectGroup,
            users: props.users,
            editing: false,
            value: null,
        };
        this.deleteUser = this.deleteUser.bind(this);
        this.addUser = this.addUser.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.submitForm = this.submitForm.bind(this);
    }

    /**
     * Update state if new props are received
     */
    componentWillReceiveProps(nextProps) {
        this.setState({
            users: nextProps.users,
            projectGroup: nextProps.projectGroup,
        })
    }

    /**
     * Send PUT request to the API to update the users that are in the project group.
     * Called when new user is added to project group.
     */
    submitForm(e) {
        e.preventDefault();
        let {projectGroup} = this.state;
        let url = config.api + '/groups/' + projectGroup.group_id;
        let request = config.api_put;
        let {users} = projectGroup;
        //Remove unnecessary information
        users.forEach(user => {
            delete user.display_name;
        });
        request.body = JSON.stringify(users);
        fetch(url,request)
            .then(response => {
                if (response.ok) {
                    alert('success');
                    this.props.refresh(); //refresh content
                } else {
                    throw new Error();
                }
            }).catch(e => {
                alert('fail');
        })
    }

    /**
     * Update state to add the currently selected user to a project group.
     * Called when the user adds a user to the project group.
     */
    addUser(e) {
        e.preventDefault();
        let {projectGroup,users,value} = this.state;
        projectGroup.users.push(users.find(user => {
            if (user.id === value) return user;
        }));
        this.setState({
            editing: true,
            projectGroup: projectGroup,
            value: null,
        });
    }

    /**
     * Update state to remove user from the project group.
     * Called when the user deletes a user from the project group.
     */
    deleteUser(id) {
        let {projectGroup} = this.state;
        projectGroup.users = projectGroup.users.filter(user => user.id !== parseInt(id));
        this.setState({projectGroup: projectGroup, editing: true})
    }

    /**
     * Update the state when another user is selected.
     * Called when the user selector changes.
     * @param {boolean} refresh - Indicates if the component should be refreshed.
     */
    handleChange(e,refresh=false) {
        let value = parseInt(e.target.value);
        if (refresh) {
	    this.setState({value: value});
        } else {
            this.state.value = value;
        }
    }

    render() {
        let user_id = parseInt(getCookie("id"));

        //Create a table of users in the project.
        let users = [];
        this.state.projectGroup.users.forEach(user => {
            users.push(<tr key={user.id}>
                <td>{user.display_name}</td>
                <td>{user.id !== user_id ?
                    <DeleteButton onClick={e => this.deleteUser(user.id)}/>
                    : null}
                </td>
            </tr>)
        });

        let header = <h2>Currently selected project group</h2>;
        if (this.state.editing) {
            header = <HeaderButton main={header} button={<SaveButton onClick={this.submitForm}/>}/>
        }

        //Create a list of all users in the module to be used as options in the user selector.
        let moduleUsers = [];
        this.state.users.forEach(user => {
            //Check if the user is a member of this module.
            if (!this.state.projectGroup.users.find(groupUser => {
                if (user.id === groupUser.id) {
                    return groupUser;
                }
            })) {
                //Set the initial value
                if (this.state.value === null) {
                    this.handleChange({
                        target: {
                            value: '' + user.id,
                        }
                    });
                }
                moduleUsers.push(<option key={user.id} value={user.id}>{user.display_name}</option>);
            }
        });

	let {value} = this.state;
        if (value === null) value = "";

        return (
            <div>
                {header}
                {users.length > 0 ?
                    <form onSubmit={this.addUser}>
                        <table className={'table'}>
                            <thead>
                                <tr>
                                    <th>display_name</th>
                                    <th>actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users}
                                <tr>
                                    <td>
                                        <select required onChange={e => {
                                                    this.handleChange(e,true);
                                                }}
                                                className={'form-control'}
                                                value={value}
                                                name={'user'}>
                                            {moduleUsers}
                                        </select>
                                    </td>
                                    <td>
                                        <CreateButton submit/>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>: config.strings.no_users
                }
            </div>
        )
    }
}
