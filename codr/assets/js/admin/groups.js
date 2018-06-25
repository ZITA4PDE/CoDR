import React from 'react';
import {CloseButton, CreateButton, ErrorDisplay, HeaderButton, Loader, Modal, SaveButton} from "../objects";
import config from "../config";
import {handleJSONResponse} from "../helpers";

/**
 * Page for managing right groups
 */

export class Groups extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            groups: null,
        };
        this.onChange = this.onChange.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    /**
     * Fetch right groups from API
     */
    componentDidMount() {
        this.setState({isLoading: true});
        let url = config.api + "/right_groups";
        fetch(url, config.api_request)
            .then(handleJSONResponse)
            .then(json => {
                this.setState({isLoading: false, groups: json});
            })
            .catch(e => {
                this.setState({isLoading: false,error: new Error('while loading groups')});
            });
    }

    /**
     * Save the data of the group creating form in the state
     * Called when value of description field in the form changes.
     */
    onChange(e) {
        this.setState({newGroup: e.target.value});
    }

    /**
     * Send post request to API to create the group.
     * This uses the newGroup field in the state as the description of the new group.
     * Called on submission of the form.
     */
    createGroup(e) {
        e.preventDefault();
        let url = config.api + '/right_groups';
        let request = config.api_post;
        request.body = JSON.stringify({
            description: this.state.newGroup,
        });
        fetch(url,request)
            .then(response => {
                if (response.ok) {
                    alert('success');
                } else {
                    alert('fail');
                }
            }).catch(e => {
                this.setState({error: new Error('while creating group')});
        })
    }

    render() {
        if (this.state.isLoading) {
            return <Loader/>;
        }

        if (this.state.error) {
            return <ErrorDisplay error={this.state.error}/>;
        }

        //Create a list of all right groups that have been fetched from the database.
        let groups = [];
        this.state.groups.forEach(group => {
            groups.push(<p key={group.id}>{group.description}</p>);
        });

        let modalID = 'createGroup';
        let header = <HeaderButton main={<h1>Groups</h1>}
                                   button={<CreateButton dataToggle={'modal'} dataTarget={modalID}/>}/>;

        return (
            <div>
                {header}
                {groups}
                <form onSubmit={this.createGroup}>
                    <Modal
                        id={modalID}
                        header={
                            <div className={"modal-header"}>
                                <h1>Create group</h1>
                            </div>
                        }
                        body={
                            <div className={"modal-body"}>
                                <label htmlFor={"description"}>description</label>
                                <input onChange={this.onChange} type={"text"} className={"form-control"}/>
                            </div>
                        }

                        footer={
                            <div className={"modal-footer"}>
                                <CloseButton onClick={this.componentDidMount}/>
                                <SaveButton submit/>
                            </div>
                        }

                    />
                </form>
            </div>
        )
    }
}
