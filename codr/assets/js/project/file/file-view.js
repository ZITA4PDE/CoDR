import config from "../../config";
import React from "react";
import {getParams, handleJSONResponse, params_to_url} from "../../helpers";
import ReactDOM from "react-dom";
import {Sidebar} from "../sidebar";
import {ErrorDisplay, Loader, Modal} from "../../objects";
import {CommentWrapper} from "./comment-feed";
import {FullFile} from "./syntax-highlight-file";
import {BreadCrumb} from "./breadcrumb";
import {ReplyModal} from "./reply-modal";

/**
 * Main file view
 */
class FileView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            path : null,
            //lines of the file
            lines : [],
            comments : [],
            isLoading : true,
            isLoadingProject : true,
            error : null,
            //Dictionary used for 
            commentDictionary : {},
            formData : {
                root : false,
                title : "",
                info : "",
                comment : "",
                parentID : null,
            },
            checkboxLines : [],
        };

        this.insertModalData = this.insertModalData.bind(this);
        this.changeReply = this.changeReply.bind(this);
        this.submitModalData = this.submitModalData.bind(this);
        this.updateCheckBoxLines = this.updateCheckBoxLines.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    /**
     * Helper method to pass down to single checkboxes to update the state of this component.
     * @param lines the line on which the checkbox is located.
     */
    updateCheckBoxLines(lines) {
        this.setState({checkboxLines : lines})
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.checkboxLines === nextState.checkboxLines;

    }

    /**
     * Helper method to insert the right data of a comment or the line range into the modal of the page.
     * @param root boolean whether the comment is on lines or on another comment.
     * @param comment on which the reply is destined if it is a reply.
     */
    insertModalData(root, comment) {
        let formData = this.state.formData;
        if (root) {
            formData.title = "Commenting on " + this.state.path.split("/").slice(-1)[0];
            formData.info = "Selected lines: " + this.state.checkboxLines;
            formData.root = true;
        } else {
            formData.title = "Replying to " + comment.author_name;
            formData.info = comment.content;
            formData.parentID = comment.id;
            formData.root = false;
        }
        this.setState({formData : formData})
    }

    /**
     * Helper method to submit the comment to the API.
     * @param e event to stop propagation.
     * @param formData data to post to the API.
     */
    submitModalData(e, formData) {
        e.preventDefault();

        let props = getParams();

        const url = config.api + params_to_url(props.module_id, props.course_id, props.exercise_id,
            props.project_id, props.file_id) + '/comments';

        let comment;

        if (formData.root) {
            let line_range = this.state.checkboxLines.toString();
            comment = {
                line_range : line_range,
                content : formData.content,
            }
        } else {
            comment = {
                parent_id : formData.parentID,
                content : formData.content,
            };

        }

        let request = config.api_post;

        request.body = JSON.stringify(comment);

        fetch(url, request)
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

    /**
     * Helper method to update the state of the reply text in the modal.
     * @param e event to use to read the state of the reply text box.
     */
    changeReply(e) {
        e.preventDefault();
        this.setState({reply : e.target.value})
    }

    /**
     * Helper method to create a dictionary where the key is the line number and the value is a list of comment id's
     * that are associated with this line number.
     * @param comments list of all the comments on the file.
     */
    static processData(comments) {
        const commentDictionary = {};

        for (let i = 0; i < comments.length; i++) {
            const comment = comments[i];
            const commentRange = comment.line_range.split(",");

            for (let i = 0; i < commentRange.length; i++) {
                if (commentRange[i] in commentDictionary) {
                    commentDictionary[commentRange[i]].push(
                        comment.id
                    );
                } else {
                    commentDictionary[commentRange[i]] = [comment.id]
                }
            }
        }
        return commentDictionary;
    }

    /**
     * Method that gets the data from the API to get the right information to display on this page.
     */
    componentDidMount() {
        let props = getParams();

        let apiString = config.api + params_to_url(props.module_id, props.course_id, props.exercise_id,
            props.project_id, props.file_id);

        fetch(apiString, config.api_request)
            .then(handleJSONResponse)
            .then(data => {
                    this.setState({
                        path : data.path,
                        lines : data.content,
                        comments : data.comments,
                        isLoading : false,
                        commentDictionary : FileView.processData(data.comments)
                    })
                }
            )
            .catch(error =>
                this.setState({error : error, isLoading : false}));

        apiString = config.api + params_to_url(props.module_id, props.course_id, props.exercise_id, props.project_id);

        fetch(apiString, config.api_request)
            .then(handleJSONResponse)
            .then(data => {
                this.setState({
                    project: data,
                    isLoadingProject: false,
                })
            }).catch(e => {
                this.setState({error: new Error('while loading project'), isLoadingProject: false});
        })
    }

    render() {
        if (this.state.isLoading || this.state.isLoadingProject) {
            return <Loader/>;
        }

        if (this.state.error) {
            return <ErrorDisplay error={this.state.error}/>
        }

        let {project} = this.state;

        return (
            <div>
                <BreadCrumb path={this.state.path}/>
                <div className={"container-fluid"}>
                    <div className={"mt-2 mb-2"}>
                        {project.can_create_comment ?
                            <button type="button" className="btn btn-outline-primary" data-toggle="modal" data-target="#reply-modal" onClick={() => this.insertModalData(true, null)}>Add comment</button>
                            : null}
                    </div>
                    <div className={"row"}>
                        <div className={"col-md-6 col-lg-8 code-block"}>
                            <FullFile
                                lines={this.state.lines}
                                commentDictionary={this.state.commentDictionary}
                                updateCheckBoxLines={this.updateCheckBoxLines}
                                can_comment={project.can_create_comment}
                            />
                        </div>
                        <div className={"col-md-6 col-lg-4 comment-block"}>
                            <CommentWrapper
                                insertModalData={this.insertModalData}
                                comments={this.state.comments}
                                refresh={this.componentDidMount}
                                root={true}
                                can_comment={project.can_create_comment}
                                params={getParams()}
                                can_comment={project.can_create_comment}
                            />
                        </div>
                    </div>
                </div>
                {project.can_create_comment ? <ReplyModal submitModalData={this.submitModalData} formData={this.state.formData} selected={this.state.checkboxLines}/>
                        : null}
            </div>
        );
    }
}



ReactDOM.render(<FileView/>, document.getElementById('main-content'));
ReactDOM.render(<Sidebar/>, document.getElementById('sidebar'));
