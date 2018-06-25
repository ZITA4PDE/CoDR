import React from 'react';
import config from '../config';
import {handleJSONResponse} from "../helpers";
import {CloseButton, CreateButton, DeleteButton, EditButton, ErrorDisplay, Loader, Modal, SaveButton} from "../objects";

/**
 * Template management page.
 * Used for creating, deleting and editing rights templates.
 */
export class Templates extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            templates: null,
            isLoading: true,
            //isLoadingGroups: true,
            //Currently active template
            active: 0,
            //Indicates if the user is editing
            editing: false,
            //holds the name of the new template that is to be created.
            newtemplate: null,
        };

        this.switchTemplate = this.switchTemplate.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.updateForm = this.updateForm.bind(this);
        this.submitTemplate = this.submitTemplate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.addTemplate = this.addTemplate.bind(this);
        this.deleteTemplate = this.deleteTemplate.bind(this);
    }

    /**
     * Fetch templates and right groups from the server.
     */
    componentDidMount() {
        this.setState({isLoading: true,isLoadingGroups: true});
        let url = config.api + '/templates';
        fetch(url,config.api_request)
            .then(handleJSONResponse)
            .then(templates => {
                this.setState({
                    templates: templates,
                    isLoading: false,
                    active: 0,
                    addTemplateSuccess: null,
                })
            }).catch(e => {
            this.setState({error: new Error('while loading templates')});
        });
    }

    /**
     * Change currently active template.
     * Called on change of template select component.
     */
    switchTemplate(e) {
        this.setState({
            active: e.target.value,
        });
    }

    /**
     * Toggle whether the user is editing or not.
     * Called when user clicks the edit button.
     */
    toggleEdit() {
        this.setState({editing: !this.state.editing});
    }

    /**
     * Update the current template so that it can be used to send to the server in a PUT put or POST request.
     * Called when one of the input fields of the template is changed while editing.
     * @param {string} name - identifier of the right that is updated
     * @param {boolean} value - new value of the field
     */
    updateForm(name,value) {
        let [group_id,rights_type,rights_category,right] = name.split('.');
        group_id = parseInt(group_id);
        let form = this.state.templates[this.state.active];
        let group = form.rights.find(function(group) {
            return group.id === group_id;
        });
        group[rights_type][rights_category][right] = value;
        this.setState({templates: this.state.templates});
    }

    /**
     * Send the edited or created template to the server.
     * If a new template has been created, a POST request is sent.
     * If an existing template has been edited a PUT request is sent.
     */
    submitTemplate(e) {
        e.preventDefault();
        this.toggleEdit();
        this.setState({isLoading: true});
        let template = this.state.templates[this.state.active];

        if (template.new) {
            let url = config.api + '/templates';
            let request = config.api_post;
            request.body = JSON.stringify(template);
            fetch(url, request)
                .then(response => {
                    if (response.ok) {
                        alert('success');
                        this.componentDidMount(); //refresh content
                    } else {
                        alert('fail');
                    }
                }).catch(e => {
                this.setState({
                    error: new Error('while creating template'),
                    isLoading: false
                });
            })
        } else {
            let url = config.api + '/templates/' + template.id;
            let success = true;
            //Send put request with template content for every right group in the template.
            for (let i=0;i<template.rights.length;i++) {
                let group = template.rights[i];
                let request = config.api_put;
                request.body = JSON.stringify(group);
                fetch(url, request)
                    .then(response => {
                        if (!response.ok) {
                            success = false;
                        }
                        if (i === template.rights.length - 1) {
                            //The last right group has been processed.
                            this.setState({isLoading: false});
                            alert(success ? "success" : "fail");
                            this.componentDidMount(); //refresh content
                        }
                    }).catch(e => {
                    this.setState({error: new Error('while updating template')});
                });
            }
        }
    }

    /**
     * Add a new template to the state and switch to editing mode.
     * The new template is a copy of the first template, which is the Default.
     * Called when user creates a new template.
     */
    addTemplate(e) {
        e.preventDefault();
        let {templates} = this.state;
        let template = JSON.parse(JSON.stringify(templates[0]));
        template.new = true;
        let index = templates.length;
        template.name = this.state.newtemplate;
        templates.push(template);
        this.setState({
            templates: templates,
            active: index,
            addTemplateSuccess: true,
            editing: true,
        })
    }

    /**
     * Delete the currently active template.
     * Called when user clicks the delete button.
     */
    deleteTemplate() {
        this.setState({isLoading: true});
        let template = this.state.templates[this.state.active];
        let url = config.api + '/templates/' + template.id;
        console.log(url);
        let request = config.api_delete;
        fetch(url,request)
            .then(response => {
                if (response.ok) {
                    alert('success');
                    this.componentDidMount(); //refresh content
                } else {
                    throw new Error();
                }
            }).catch(e => {
                alert('fail');
        })
    }

    render() {
        if (this.state.isLoading) {
            return <Loader/>;
        }

        if (this.state.error) {
            return <ErrorDisplay error={this.state.error}/>;
        }

        //Create a list of templates which can be used as the options for the template select component
        let templates = [];
        for(let i=0;i<this.state.templates.length;i++) {
            let template = this.state.templates[i];
            templates.push(
                <option key={i} value={i}>{template.name}</option>
            );
        }

        let inlineClass = "form-control mr-1";

        return (
            <div>
                <label htmlFor={"template"}>Select a template to view</label>
                <div className={"form-inline"}>
                    <select name={"template"} className={inlineClass} value={this.state.active} onChange={this.switchTemplate}>
                        {templates}
                    </select>
                    {this.state.editing? <SaveButton className={inlineClass} onClick={this.submitTemplate}/> :
                        <div>
                            <EditButton className={inlineClass} onClick={this.toggleEdit}/>
                            <div className={inlineClass}>
                                <CreateButton dataToggle={'modal'} dataTarget={'createTemplate'}/>
                            </div>
                            <div className={inlineClass}>
                                <DeleteButton big onClick={this.deleteTemplate}/>
                            </div>
                        </div>
                    }
                </div>
                {templates.length > 0 ? <TemplateView template={this.state.templates[this.state.active]} editing={this.state.editing} onChange={this.updateForm}/>: null}
                <form onSubmit={this.addTemplate}>
                    <Modal id={"createTemplate"}
                           header={
                               <div className={"modal-header"}>
                                   <h1>create template</h1>
                               </div>
                           }
                           body={
                               <div className={"modal-body"}>
                                   {this.state.addTemplateSuccess === null ?
                                       <div>
                                           <label htmlFor={"description"}>description</label>
                                           <input className={"form-control"} type={"text"} required onChange={e => {
                                               this.state.newtemplate = e.target.value;
                                           }}/>
                                       </div> :
                                       <h1>{this.state.addTemplateSuccess ? 'Template added' : 'Template adding failed'}</h1>
                                   }
                               </div>
                           }
                           footer={
                               <div className={"modal-footer"}>
                                   <CloseButton/> {this.state.addTemplateSuccess === null ? <SaveButton submit/> : null}
                               </div>
                           }
                    />
                </form>
            </div>
        )
    }
}

/**
 * A single template.
 */
class TemplateView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            template: this.props.template,
            editing: this.props.editing,
        }
    }

    /**
     * Update the state if the props are updated.
     */
    componentWillReceiveProps(nextProps) {
        this.setState({
            template: nextProps.template,
            editing: nextProps.editing,
        });
    }

    /**
     * Create an accordion with a card for each right group in the template.
     */
    render() {
        let {template} = this.state;
        let groups = [];
        template.rights.forEach(group => {
            groups.push(
                <div key={group.id} className={"card"}>
                    <div id={"header"+group.id} className={"card-header"} data-toggle="collapse" data-target={"#collapse"+group.id} aria-controls={"collapse"+group.id}>
                        <h2>{group.description}</h2>
                    </div>
                    <div id={'collapse' + group.id} className={"collapse"} aria-labelledby={"header"+group.id} data-parent="#accordion">
                        <div className={"card-body"}>
                            <div className={"container-fluid"}>
                                <h3>Project rights</h3>
                                <div className={"row"}>
                                    <div className={"col"}>
                                        <h4>Member</h4>
                                        <ProjectRights name={group.id + '.project_rights.member'} rights={group.project_rights.member} editing={this.state.editing} onChange={this.props.onChange}/>
                                    </div>
                                    <div className={"col"}>
                                        <h4>Other</h4>
                                        <ProjectRights name={group.id + '.project_rights.other'} rights={group.project_rights.other} editing={this.state.editing} onChange={this.props.onChange}/>
                                    </div>
                                </div>
                                <h3>Comment rights</h3>
                                <div className={"row"}>
                                    <div className={"col"}>
                                        <h4>Owner</h4>
                                        <CommentRights name={group.id + '.comment_rights.owner'} rights={group.comment_rights.owner} editing={this.state.editing} onChange={this.props.onChange}/>
                                    </div>
                                    <div className={"col"}>
                                        <h4>Member</h4>
                                        <CommentRights name={group.id + '.comment_rights.member'} rights={group.comment_rights.member} editing={this.state.editing} onChange={this.props.onChange}/>
                                    </div>
                                    <div className={"col"}>
                                        <h4>Other</h4>
                                        <CommentRights name={group.id + '.comment_rights.other'} rights={group.comment_rights.other} editing={this.state.editing} onChange={this.props.onChange}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });

        return (
            <form>
                <div id={"accordion"}>
                    {groups}
                </div>
            </form>
        )
    }
}

class ProjectRights extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: this.props.editing,
            rights: this.props.rights, //rights that have to be displayed.
            name: this.props.name, //name of the form field. This is used to put edited values at the right place in the template object.
        }
    }

    /**
     * Update state if new props are received
     */
    componentWillReceiveProps(nextProps) {
        this.setState({
            editing: nextProps.editing,
            rights: nextProps.rights,
            name: nextProps.name,
        });
    }

    render() {
        let {rights,name} = this.state;

        return (
            <div>
                <label htmlFor={name + '.can_view'}>Can view</label>
                <Right name={name + ".can_view"} value={rights.can_view} editing={this.state.editing} onChange={this.props.onChange}/>
                <label htmlFor={name + '.can_edit'}>Can edit</label>
                <Right name={name + ".can_edit"} value={rights.can_edit} editing={this.state.editing} onChange={this.props.onChange}/>
                <label htmlFor={name + '.can_delete'}>Can delete</label>
                <Right name={name + ".can_delete"} value={rights.can_delete} editing={this.state.editing} onChange={this.props.onChange}/>
                <label htmlFor={name + '.can_create_comment'}>Can create comment</label>
                <Right name={name + ".can_create_comment"} value={rights.can_create_comment} editing={this.state.editing} onChange={this.props.onChange}/>
                <label htmlFor={name + '.can_create_visible_comment'}>Can create visible comment</label>
                <Right name={name + ".can_create_visible_comment"} value={rights.can_create_visible_comment} editing={this.state.editing} onChange={this.props.onChange}/>
            </div>
        )
    }
}

class CommentRights extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: this.props.editing,
        }
    }

    /**
     * Update state if editing is changed in the props
     */
    componentWillReceiveProps(nextProps) {
        this.setState({editing: nextProps.editing});
    }

    render() {

        let {rights,name} = this.props;

        return (
            <div>
                <label htmlFor={name + '.can_view'}>Can view</label>
                <Right name={name + ".can_view"} value={rights.can_view} editing={this.state.editing} onChange={this.props.onChange}/>
                <label htmlFor={name + '.can_edit'}>Can edit</label>
                <Right name={name+ ".can_edit"} value={rights.can_edit} editing={this.state.editing} onChange={this.props.onChange}/>
                <label htmlFor={name + '.can_delete'}>Can delete</label>
                <Right name={name + ".can_delete"} value={rights.can_delete} editing={this.state.editing} onChange={this.props.onChange}/>
                <label htmlFor={name + '.can_toggle_visibility'}>Can toggle visibility</label>
                <Right name={name + ".can_toggle_visibility"} value={rights.can_toggle_visibility} editing={this.state.editing} onChange={this.props.onChange}/>
            </div>
        )
    }
}

/**
 * Display a single right.
 * If editing display a selector. Otherwise just display the value as text.
 */
class Right extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: this.props.editing,
            value: this.props.value, 
        };
        this.onChange = this.onChange.bind(this);
    }

    /**
     * Update editing and value if they change in the props
     */
    componentWillReceiveProps(nextProps) {
        this.setState({
            editing: nextProps.editing,
            value: nextProps.value,
        });
    }

    /**
     * Update the value of the changed right in state of the template
     * Calls Templates.updateForm
     */
    onChange(e) {
        let value = e.target.value === "true";
        this.props.onChange(e.target.name,value);
    }

    render() {
        let res = this.state.editing ?
            <select className={"form-control"} name={this.props.name} value={this.state.value.toString()} onChange={this.onChange}>
                <option value={"true"}>true</option>
                <option value={"false"}>false</option>
            </select>
            : <p>{this.state.value.toString()}</p>;

        return (
            res
        )
    }
}
