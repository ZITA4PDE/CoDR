import React from 'react';
import config from '../config';
import {getParams, handleJSONResponse, params_to_url} from "../helpers";
import Dropzone from 'react-dropzone';
import {TreeView} from "../react-bootstrap-treeview";

import {ErrorDisplay, Loader, Modal} from "../objects";
import {FullFile} from "./file/syntax-highlight-file";

const params = getParams();
const baseUrl = params_to_url(params.module_id,params.course_id,params.exercise_id,params.project_id);

export class Sidebar extends React.Component {
    constructor() {
        super();
        this.state = {
            accept: 'text/*',
            isLoading: true,
            project: null,
            files: [],
        };
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }

    onFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData();

        this.state.files.forEach(file => {
            formData.append('files[]', file, file.name);
        });

        const url = config.api+baseUrl+ '/files';
	let request = config.api_post;
	delete request.headers;
	request.body = formData;

        fetch(url,request)
	    .then(response => {
            if (response.ok) {
                alert('Success');
                this.componentDidMount();
            } else {
                alert('fail');
            }
        }).catch(function(e) {
            alert(e);
        });
    }

    onDrop(acceptedFiles, rejectedFiles) {
        for (let i = 0; i < acceptedFiles.length; i++) {
            this.state.files.push(acceptedFiles[i])
        }

        this.setState(this.state);
    }

    onDelete(file,id) {
        let newFiles = this.state.files;
        newFiles.splice(id, 1);
        window.URL.revokeObjectURL(file.preview);
        this.setState({files: newFiles})
    }

    componentDidMount() {
        this.setState({isLoading: true});
        fetch(config.api + baseUrl, config.api_request)
            .then(handleJSONResponse)
            .then(json => {
                this.setState({
                    project: json,
                    isLoading: false
                });
            })
            .catch(e => {
                this.setState({
                    isLoading: false,
                    error: new Error('while loading project')
                })
            });
    }

    filesToTree(files) {
        files.forEach(myFile => {
            myFile.text = myFile.path;
            myFile.href = params_to_url(params.module_id,params.course_id,params.exercise_id,params.project_id,myFile.id);
        });
        return files;
    }

    render() {
        if (this.state.isLoading) {
            return <Loader/>;
        }

        if (this.state.error) {
            return <ErrorDisplay error={this.state.error}/>;
        }

        let options = {
            collapseIcon: "fa fa-folder-open",
            expandIcon: "fa fa-folder",
            emptyIcon: "fa fa-file",
            enableLinks: "true",
            levels: 5
        };

        const customStyle = {
            "height" : "60vh",
            "width" : "100%",
            "borderColor" : "rgb(102, 102, 102)",
            "borderStyle" : "dashed",
            "borderRadius" : "1em",
            "overflowY" : "auto",
        };

        let {files,can_edit} = this.state.project;

        let treeView = <p>{config.strings.no_files}</p>;
        if (files.length > 0) {
            treeView = <TreeView data={this.filesToTree(files)} options={options}/>
        }

        let ul = [];

        for (let i = 0; i < this.state.files.length; i++) {
            ul.push(
                <FileObject key={i} file={this.state.files[i]} id={i} onDelete={this.onDelete}/>
            )
        }

        return (
            <div>
                {can_edit ? <UploadButton/>: null}
                {treeView}
                <Modal  id={"uploadModal"}
                        header={
                            <div className="modal-header">
                                <h5 className="modal-title">File upload - <span className={"text-info"}>click to delete a file</span></h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        }
                        body={
                            <div className={"modal-body"}>
                                <Dropzone
                                    style={customStyle}
                                    onDrop={this.onDrop.bind(this)}
                                >
                                    <ul>
                                        {ul}
                                    </ul>
                                </Dropzone>
                            </div>
                        }
                        footer={
                            <div className={"modal-footer"}>
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.onFormSubmit}>Upload files</button>
                            </div>
                        }/>
            </div>
        );
    }
}

class FileObject extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file : props.file,
            id : props.id,
        };
        this.onDelete = props.onDelete.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            file: nextProps.file,
            id: nextProps.id,
        });
    }

    render() {
        return (
            <li key={"file-object-" + this.state.id}>
                <div>
                    <span className="fa fa-file-o clickable glyphicon-big" onClick={(e) => {e.stopPropagation(); this.onDelete(this.state.file, this.state.id)}}>{this.state.file.name}</span>
                </div>
            </li>
        );
    }
}

class UploadButton extends React.Component {
    render() {
        return (
            <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#uploadModal">
                Upload file
            </button>
        )
    }
}

