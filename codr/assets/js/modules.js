import React from 'react';
import ReactDOM from 'react-dom';
import '../stylesheets/_yeti_variables.scss';
import config from './config';

import '../stylesheets/modules.scss';
import {CreateButton, MCForm, HeaderButton, Loader, Modal, SaveButton, ErrorDisplay, DeleteButton} from "./objects";
import {handleJSONResponse, params_to_url} from "./helpers";

/**
 * Main modules page.
 */
class Modules extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            modules: null,
            can_edit: null,
            isLoading : true,
            error: null,
            form : {},
            postSuccess: null,
        };

        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    /**
     * Fetch modules and can_edit from the API.
     * can_edit indicates that the user can create a new module.
     */
    componentDidMount() {
        fetch(config.api + "/modules/", config.api_request)
            .then(handleJSONResponse)
            .then(data => {
                this.setState({
                    modules: data.modules,
                    can_edit: data.can_edit,
                    isLoading : false,
                    postSuccess: null,
                });
            })
            .catch(error => {
                console.log(error.message);
                this.setState({ error: new Error('while loading modules'), isLoading: false })
            });
    }

    /**
     * Update the form in the state.
     * Called when the input fields in the create module form change.
     */
    handleChange(e) {
        this.state.form[e.target.name] = e.target.value;
        this.setState(this.state);
    }

    /**
     * Send a POST request to the API to create a module.
     * Called when a module is created.
     */
    onFormSubmit(e) {
        e.preventDefault();
        this.setState({isPosting: true});
        console.log(this.state.form);
        let request = config.api_post;
        request.body = JSON.stringify(this.state.form);
        fetch(config.api + "/modules",request)
            .then(response => {
            if (response.ok) {
                this.setState({postSuccess: true})
            } else {
                throw new Error('Module creation failed');
            }
        }).catch(e => {
            this.setState({postSuccess: false,error: e});
        });
        this.setState({isPosting: false});
    }

    render() {
        if (this.state.error) {
            return (
                <ErrorDisplay error={this.state.error} />
            );
        }
        if (this.state.isLoading) {
            return (
                <Loader/>
            );
        }

        let {modules,can_edit} = this.state;

        let header = <h1> Modules </h1>;
        let modalID = "createModule";

        if (can_edit) {
            header = <HeaderButton
                main={header} button={<CreateButton dataToggle={"modal"} dataTarget={modalID}/>}
            />
        }

        let postStatus = this.state.isPosting ? <Loader/> :
            <h1>{this.state.postSuccess ? "Module successfully created" : "Module creation failed"}</h1>;

        return (
            <div>
                {header}
                {modules.map(module => <Module key={module.id} handleClick={this.handleClick} module={module}/>)}
                {can_edit ?
                    <form id="moduleCreateForm" onSubmit={this.onFormSubmit}>
                    <Modal  id={modalID}
                            header={
                                <div className={"modal-header"}>
                                    <h1>Create Module</h1>
                                </div>
                            }
                            body={
                                <div className={"modal-body"}>
                                    {this.state.postSuccess !== null ?
                                        postStatus
                                    : <MCForm onChange={this.handleChange}/>}
                                </div>}
                            footer={
                                <div className={"modal-footer"}>
                                    <button type="button"
                                            className="btn btn-secondary"
                                            data-dismiss="modal"
                                            onClick={this.componentDidMount.bind(this)}>Close</button>
                                    {this.state.postSuccess === null ? <SaveButton submit/>: null}
                                </div>}
                        />
                    </form>: null}
            </div>
        );
    }

    /**
     * Go to the module view.
     * Called when a module is clicked.
     * @param {int} id - module id.
     */
    handleClick(id) {
        window.location.href = config.website + "/modules/" + id;
    }

}

class Module extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deleted: false
        }
    }

    /**
     * Send a DELETE request to the API to delete the module.
     */
    deleteModule(module) {
        let url = config.api + params_to_url(module.id);
        console.log(url);
        let request = config.api_delete;
        fetch(url,request)
            .then(response => {
                if (response.ok) {
                    alert('success');
                    this.setState({deleted: true});
                } else {
                    throw new Error();
                }
            }).catch(e => {
                alert('fail');
        })
    }

    render() {
        if (this.state.deleted) {
            return null;
        }
        let {module} = this.props;
	let header = <h5 className={"card-title"}>{module.name}</h5>;

        if (module.can_edit) {
            header=<HeaderButton main={header}
                                  button={<DeleteButton onClick={e => {
                                      e.stopPropagation();
                                      this.deleteModule(module);
                                  }}/>}/>;
	}

        return (
            <div className={"card module-card"} onClick={() => this.props.handleClick(module.id)}>
                <div className={"card-header"}>
		    {header}
                </div>
                <div className={"card-body"}>
                    <p className={"card-text"}>{module.description}</p>
                </div>
            </div>
        )
    }
}

ReactDOM.render(<Modules/>, document.getElementById('modules'));
