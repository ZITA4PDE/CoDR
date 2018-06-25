/**
 * Used for displaying comments in profile view.
 */
import React from 'react';
import config from './config';
import '../stylesheets/comment.scss';
import {ToggleVisibilityButton,DeleteButton} from "./objects";
import {toggleVisibility,timestampToDate, params_to_url} from "./helpers";

export class Comment extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            link : props.link,
            isLoading : true,
            error : null,
            targetIDS : props.targetIDS,
            comment: props.comment,
            refresh: props.refresh,
        };

        this.deleteComment = this.deleteComment.bind(this);
    }

    /**
     * Update state when the props change
     */
    componentWillReceiveProps(nextProps) {
        this.setState({
            comment: nextProps.comment,
        });
    }

    /**
     * Send a DELETE request to the API to delete the comment.
     * Called when user clicks the delete button.
     */
    deleteComment() {
        let comment = this.state.comment;
        let request = config.api_delete;
        let link = params_to_url(comment.module_id,comment.course_id,comment.exercise_id,comment.project_id,comment.file_id);
        link += '/comments/' + comment.id;

        fetch(config.api + link,request)
            .then(response => {
                if(response.ok) {
                    alert('Comment deleted');
                    comment.deleted = true;
                    this.setState({comment: comment});
                } else {
                    throw new Error();
                }
            }).catch(e => {
                alert('Deletion failed');
        });
    }

    render() {
        let comment = this.state.comment;
        let button = null;

        if (comment.deleted) {
            return null;
        }

        if(this.props.file_link) {
            let link = params_to_url(comment.module_id,comment.course_id,comment.exercise_id,comment.project_id,comment.file_id);
            link += '#comment-' + comment.id;
            button =
                <div className={"col-md-1"}>
                    <a id="comment_button" role="button" className="btn btn-primary" href={link}>Go to file</a>
                </div>;
        }

        let date = timestampToDate(comment.timestamp);

        let className="card";
        if (!comment.visible) {
            className += " _invisible";
        }

        return (
            <div className={className} data-toggle="collapse" data-target=".multi-collapse" aria-controls={this.state.targetIDS}>
                <div className="card-header">
                    <b>{comment.author_name}</b> {config.strings.comment_header} {date}
                        <div className={"float-right"}>
                            {comment.can_toggle_visibility ?
                                <ToggleVisibilityButton visible={comment.visible} onClick={e => {
                                    toggleVisibility(comment,this.state.refresh);
                                }}/>:null
                            }
                            {comment.can_delete ?
                                <DeleteButton onClick={this.deleteComment}/>
                            :null}
                        </div>
                </div>
                <div className="card-body">
                    <div className={"row"}>
                         <div className={"col-md-11"}>
                            {comment.content}
                        </div>
                        {button}
                    </div>
                </div>
            </div>
        )
    }
}

export class CommentList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: props.comments,
            //Function that is called to refresh the data
            refresh: props.refresh, 
        }
    }

    /**
     * Update state when comments change in the props.
     */
    componentWillReceiveProps(nextProps) {
        this.setState({
            comments: nextProps.comments,
        });
    }

    render() {
        const {comments,refresh} = this.state;

        let content;

        let commentList = [];
        comments.forEach((comment) => {
            commentList.push(
                <Comment
                    key={comment.id}
                    comment={comment}
                    refresh={refresh}
                    file_link={this.props.button}/>
            );
        });

        content =
            <div id={"commentList"}>
                {commentList.length !== 0  ? commentList :
                    <p>{config.strings.no_messages}</p>}
            </div>;

        return (
            <div>
                <h1>Latest messages</h1>
                {content}
            </div>
        )
    }
}
