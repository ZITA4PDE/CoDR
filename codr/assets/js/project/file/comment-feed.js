import config from "../../config";
import React from "react";
import {toggleVisibility,removeComment,timestampToDate} from "../../helpers";
import {ToggleVisibilityButton,DeleteButton} from "../../objects";

class Comment extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            comment : props.comment,
            dataToggle : props.dataToggle,
            dataTarget : props.dataTarget,
            //Lines that this comment refers to
            lines : props.lines,
            //Function that is used to insert the data of the current comment in the form.
            insertModalData : props.insertModalData,
            hasChildren : props.hasChildren,
            can_comment : props.can_comment,
        };
    }

    /**
     * Update state if the comment is updated.
     */
    componentWillReceiveProps(nextProps) {
        this.setState({
            hasChildren: nextProps.hasChildren,
            comment: nextProps.comment,
        })
    }

    render() {
        let {comment,can_comment} = this.state;

        let date = timestampToDate(comment.timestamp);

        let className = "card";
        //If comment is not visible add a class so that the correct css is applied.
        if (!comment.visible) {
            className += " _invisible";
        }

        return (
            <div className={className}>
                <div className="card-header">
                    <b>{comment.author_name}</b> {config.strings.comment_header} {date}
                    <div className={"float-right"}>
                    {
                        comment.can_toggle_visibility ?
                            <ToggleVisibilityButton visible={comment.visible} 
                                onClick={
                                e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleVisibility(comment,this.props.refresh);
                                }}/>:null
                    }
                    {
                        comment.can_delete && !comment.deleted ?
                                <DeleteButton onClick={
                                    e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeComment(comment,this.props.refresh);
                                    }}/>:null
                    }
                    </div>
                </div>
                <div className="card-body">
                    {comment.content}
                    {can_comment && !comment.deleted ? <button className="btn btn-primary btn-sm float-right reply-button" data-toggle="modal"
                            data-target="#reply-modal"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                this.state.insertModalData(false, comment)
                            }}
                    >
                        <i className="fa fa-reply"/>
                    </button> : null }
                    {
                        this.state.hasChildren ?
                            <p>
                                <span className="text-info text-center"
                                     data-toggle={this.state.dataToggle}
                                     data-target={this.state.dataTarget}
                                     aria-expanded={window.location.hash ? true : false}>
                                    {"click here to show/hide reactions"}
                                </span>
                            </p> : null
                    }
                </div>
            </div>
        );
    }
}

/**
 * Display child comments under a comment.
 * Adds padding and makes the child comments list collapse.
 * This component is used recursively so that children of children are also displayed correctly.
 */
export class CommentWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //Root comment
            root : props.root,
            //child comments
            comments : props.comments,
            //Function that is used to insert the data of the current comment in the form.
            insertModalData : props.insertModalData,
            can_comment : props.can_comment,
            //Url parameters
            params: props.params,
        };
    }
    
    /**
     * Update state if the comments for this wrapper change
     */
    componentWillReceiveProps(nextProps) {
        this.setState({comments: nextProps.comments})
    }

    render() {
        let commentList = [];
        let {can_comment} = this.state;
        let {params} = this.props;

        //For all child comments
        this.state.comments.forEach(comment => {
            //Add path paramters that are used in the request urls
            comment.module_id = params.module_id;
            comment.course_id = params.course_id;
            comment.exercise_id = params.exercise_id;
            comment.project_id = params.project_id;

            let lines;

            let className;
            let divID = "comment-" + comment.id;
            let onMouseEnter;
            let onMouseLeave;
            let dataToggle;
            let dataTarget;
            //Recursion
            let childComments = <CommentWrapper can_comment={can_comment} refresh={this.props.refresh} params={params} comments={comment.children} root={false} insertModalData={this.state.insertModalData}/>;

            if (this.state.root) {
                //Comment is a root comment, i.e. has no parent.
                lines = comment.line_range.split(",");
                className = "root-comment";
                onMouseEnter = () => onMouse(divID, lines, true);
                onMouseLeave = () => onMouse(divID, lines, false);
                if (comment.children) {
                    dataToggle = "collapse";
                    dataTarget = "#children-" + comment.id;
                    //Wrap child comments in collapsible div.
                    childComments = <div id={"children-" + comment.id} className={dataToggle + (window.location.hash ? " show": "")}>{childComments}</div>;
                }
            } else {
                className = "comment";
            }

            //Add comment to the comment list
            commentList.push(
                <div id={divID} key={comment.id} className={className} onMouseEnter={onMouseEnter}
                     onMouseLeave={onMouseLeave}

                >
                    <Comment
                        comment={comment}
                        lines={lines}
                        dataToggle={dataToggle}
                        dataTarget={dataTarget}
                        refresh={this.props.refresh}
                        insertModalData={this.state.insertModalData}
                        hasChildren={this.state.root && comment.children.length > 0}
                        can_comment={can_comment}
                    />
                    {childComments}
                </div>);
        });

        return commentList;
    }
}

/**
 * Highlight a comment and all its children.
 * @param {object} commentDiv - DOM element of the comment.
 * @param {string} commentColor - background color that the comment should have.
 * @param {boolean} root - indicates if the comment is a root comment.
 */
export const recursiveCommentHighlight = (commentDiv, commentColor, root) => {
    if (commentDiv && commentDiv.childElementCount > 0) {
        const children = commentDiv.children;
        children[0].style.background = commentColor;
        if (root) {
            const toggleDiv = children[1];
            const toggleDivChildren = toggleDiv.children;
            if (toggleDiv) {
                for (let i = 0; i < toggleDiv.childElementCount; i++) {
                    recursiveCommentHighlight(toggleDivChildren[i], commentColor, false);
                }
            }
        } else {
            for (let i = 1; i < commentDiv.childElementCount; i++) {
                recursiveCommentHighlight(children[i], commentColor, false)
            }
        }
    }
};

/**
 * Use recursiveCommentHighlight to highlight a comment and its children.
 * Called when a user hovers over a comment.
 * @param {int} id - id of comment div.
 * @param {array} lines - lines that the comment references.
 * @param {boolean} highlight - indicates if highlighting should be enabled or disabled.
 */
export const onMouse = (id, lines, highlight) => {

    const lineColor = highlight ? "rgba(255, 255, 0)" : "rgba(255, 255, 255)";

    const commentColor = highlight ? "rgba(255, 255, 0, 0.2)" : "rgba(255, 255, 255)";

    let element = document.getElementById(id);

    if (element) {

        recursiveCommentHighlight(element, commentColor, true);

        for (let i = 0; i <= lines.length; i++) {
            let element = document.getElementById("comment-line-" + lines[i]);

            if (element) {
                //Highlight line
                element.firstElementChild.style.background = lineColor;
            }
        }
    }
};

