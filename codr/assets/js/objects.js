/**
 * Objects that can be reused anywhere on the website.
 */
import React from 'react';
import {BeatLoader} from 'react-spinners';
import {handleJSONResponse} from "./helpers";

import '../stylesheets/objects.scss';
import * as config from "./config";

/**
 * Button to toggle visibility of a component.
 * Props:
 *  {boolean} visible - indicates if the component is currently visible.
 *  {function} onClick
 */
export class ToggleVisibilityButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            visible: nextProps.visible,
        });
    }

    render() {
        let icon = this.state.visible ? "fa fa-eye-slash" : "fa fa-eye";
        return (
            <button type="button" className="btn btn-sm btn-warning mr-1" onClick={this.props.onClick}><i className={icon}/></button>
        )
    }
}

/**
 * Button to delete a component.
 * Props:
 *  {boolean} big - Indicates if the button should be big.
 *  {function} onClick
 */
export class DeleteButton extends React.Component {
    render() {
        let className = "btn btn-danger";
        if (!this.props.big) {
            className += " btn-sm";
        }
        return (
            <button type="button" className={className} onClick={e => {
		e.stopPropagation();
                if (confirm('Are you sure you would like to delete this item?'))
                this.props.onClick(e);
            }}>delete</button>
        )
    }
}

/**
 * Button to close a modal.
 * Props:
 *  {function} onClick
 */
export class CloseButton extends React.Component {
    render() {
        return (
            <button type="button"
                    className="btn btn-secondary"
                    data-dismiss="modal"
                    onClick={this.props.onClick}>Close</button>
        )
    }
}

/**
 * Button to edit a component.
 * Props:
 *  {boolean} small - Indicates if the button should be small.
 *  {function} onClick
 */
export class EditButton extends React.Component {
    render() {
        let className="btn btn-warning";
        if (this.props.small) {
            className += " btn-sm";
        }
        return (
            <button type="button" className={className} onClick={this.props.onClick}>edit</button>
        )
    }
}

/**
 * Button to create a component.
 * Props:
 *  {string} dataToggle
 *  {string} dataTarget
 *  {function} onClick
 */
export class CreateButton extends React.Component {
    render() {
        return (
            <button type={this.props.submit ? "submit" : "button"}
                    className={"btn btn-primary"}
                    data-toggle={this.props.dataToggle}
                    data-target={'#' + this.props.dataTarget}
                    onClick={this.props.onClick}>
                <i className={"fa fa-plus"}/>
            </button>
        )
    }
}

/**
 * Create a header with a button on the right.
 * Props:
 *  {object} main - content of the header.
 *  {object} button
 */
export class HeaderButton extends React.Component {
    render() {
        return (
            <div className={"row"}>
                <div className={"col-lg-11"}>
                    {this.props.main}
                </div>
                <div className={"col-lg-1 text-right"}>
                    {this.props.button}
                </div>
            </div>
        )
    }
}

/**
 * Button to save a form.
 * Props:
 *  {boolean} submit - Indicates if the button should be a submit button.
 *  {string} dataDismiss
 *  {function} onClick
 */
export class SaveButton extends React.Component {
    render() {
        if(this.props.submit) {
            return (
                <button type="submit" className={"btn btn-primary"}>Save</button>
            )
        } else {
            return (
                <button type="button" className={"btn btn-primary"} data-dismiss={this.props.dataDismiss} onClick={this.props.onClick}>Save</button>
            )
        }
    }
}

/**
 * Loading icon, used when a component is loading data from the API.
 */
export class Loader extends React.Component {
    render() {
        return (
            <div className={"loader"} style={{
            }}>
                <BeatLoader
                    color={'#2196F3'}
                    loading={true}
                />
            </div>
        )
    }
}

/**
 * General purpose modal.
 * Props:
 *  {string} id - id of the modal div.
 *  {object} header - header of the modal.
 *  {object} body - body of the modal.
 *  {object} footer - footer of the modal.
 */
export class Modal extends React.Component {

    render() {
        return (
            <div className="modal fade"
                 id={this.props.id}
                 tabIndex="-1"
                 role="dialog"
                 aria-labelledby="exampleModalLabel"
                 aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content custom-modal">
                            {this.props.header}
                            {this.props.body}
                            {this.props.footer}
                    </div>
                </div>
            </div>
        )
    }
}

/**
 * Form to create/edit a Module or Course
 * Props:
 *  {function} onChange
 */
export class MCForm extends React.Component {
    render() {
        return (
            <div className={"form-group"}>
                <label htmlFor="name">Name</label>
                <input onChange={this.props.onChange} className={"form-control"} id="name" name={"name"} type={"text"} placeholder={"Name"}/>
                <label htmlFor="description">Description</label>
                <textarea onChange={this.props.onChange} className={"form-control"} name={"description"} placeholder={"Description"} rows={"10"}/>
            </div>
        )
    }
}

/**
 * Display an error message.
 * Props:
 *  {Error} error - the error to be displayed.
 */
export class ErrorDisplay extends React.Component {
    render() {
        return (
            <h1>{'Error occurred ' + this.props.error.message}</h1>
        )
    }
}

/**
 * Create a bootstrap tabs component.
 * Props:
 *  {object} divs - the different tabs to be displayed.
 *  {string} active - the name of the tab that should be active.
 */
export class NavTabs extends React.Component {
    render() {

        let divs = [];

        for (let target in this.props.divs) {
            let div = this.props.divs[target];

            let className = "tab-pane fade";
            if (this.props.active === target) {
                className += " show active";
            }

            divs.push(
                <div key={target} className={className} id={target} role={"tabpanel"} aria-labelledby={target + "-tab"}>
                    {div.content}
                </div>
            );
        }

        return (
            <div className={"tab-content"}>
                {divs}
            </div>
        )
    }
}

/**
 * Form to create/edit an exercise
 */
export class ExerciseForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            templates: null,
            isLoading: true,
            editing: this.props.editing,
            exercise: props.exercise,
            //value of the template selector.
            value: null,
        }
    }

    /**
     * Update stat when editing status changes in props.
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.editing !== this.state.editing) this.setState({editing: nextProps.editing});
    }

    /**
     * Fetch templates from the API.
     */
    componentDidMount() {
        this.setState({isLoading: true});
        let url = config.api + '/templates';
        fetch(url,config.api_request)
            .then(handleJSONResponse)
            .then(templates => {
                this.setState({
                    isLoading: false,
                    templates: templates,
                })
            }).catch(e => {
            this.setState({isLoading: false, error: new Error('while loading right templates')});
        })
    }

    render() {
        if (this.state.isLoading) {
            return <Loader/>;
        }

        if (this.state.error) {
            return <ErrorDisplay error={this.state.error}/>;
        }

        let {editing,templates} = this.state;
        let {exercise} = this.state;

        //If there is no data use null.
        if (!exercise) {
            exercise = {
                name: null,
                description: null,
            }
        }

        //Create a list of templates to be used as options for the template selector.
        let current_template = null;
        let current_id = null;
        let options = [];
        for(let i=0;i<templates.length; i++) {
            let template = templates[i];
            options.push(<option key={template.id} value={parseInt(template.id)}>{template.name}</option>);
            //set current_id to the first template
            if (current_id === null) {
                current_id = template.id;
            }
            //if there is already a rights template for this exercise set current_template to that template.
            if (template.id === exercise.rights_template_id) {
                current_template = template;
            }
        }

        //If there is no current template, use the first (as indicated by current_id).
        if (current_template) {
            current_id = current_template.id;
        }

        //Update the value in the state if necessary.
        if (this.state.value === null) {
            this.state.value = current_id;
            this.props.onChange({
                target: {
                    name: "rights_template_id",
                    value: current_id,
                }
            }, false);
        }

        return (
            <div className={"form-group"}>
                <label htmlFor="name">Name</label>
                {editing ? <input onChange={this.props.onChange}
                                className={"form-control"}
                                required
                                id="name"
                                name={"name"}
                                type={"text"}
                                value={exercise.name || undefined}
                                placeholder={"Name"}/>
                    : <p>{exercise.name}</p>}
                <label htmlFor="description">Description</label>
                {editing ? <textarea onChange={this.props.onChange}
                                     className={"form-control"}
                                     required
                                     name={"description"}
                                     placeholder={"Description"}
                                     value={exercise.description || undefined}
                                     rows={"10"}/>
                    : <p>{exercise.description}</p>}
                <label htmlFor={"template"}>Template</label>
                {editing ? <select onChange={this.props.onChange}
                                   name={"rights_template_id"}
                                   value={exercise.rights_template_id}
                                   className={"form-control"}>
                    {options}
                </select> : <p>{current_template.name}</p>}
            </div>
        )
    }
}
