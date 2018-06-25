import React from "react";
import {Modal} from "../../objects";
import * as config from "../../config";

export class ReplyModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            root : props.formData.root,
            title : props.formData.title,
            info : props.formData.info,
            content : "",
            parentID : props.formData.parentID,
        };
        this.changeReply = this.changeReply.bind(this);
        this.submitModalData = props.submitModalData.bind(this);
    }

    /**
     * Method that gets called if the state of the parent changes to update the state of this component.
     * @param nextProps The updates properties.
     */
    componentWillReceiveProps(nextProps) {
        this.setState({
            root : nextProps.formData.root,
            title : nextProps.formData.title,
            info : nextProps.formData.info,
            parentID : nextProps.formData.parentID,
        })
    }


    /**
     * Helper method to insert data from the reply text box into the state.
     * @param e event to read the new value of the text box.
     */
    changeReply(e) {
        e.preventDefault();
        this.setState({content : e.target.value})
    }

    render() {
        let enabled = !this.state.root || this.props.selected.length > 0;
        let info = this.state.info;
        if (!enabled) {
            info = <span className={'text-danger'}>{config.strings.no_lines}</span>;
        }
        return (
            <Modal
                id={"reply-modal"}
                header={
                    <div className="modal-header">
                        <h5 className="modal-title">{this.state.title}</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                }
                body={
                    <div className="modal-body">
                        <div className="comment-reply-comment">
                            {info}
                        </div>
                        <form id={"modal-form"}>
                            <div className="form-group">
                                <h2><label htmlFor="reply-input">{"Comment: "}</label></h2>
                                <textarea className="form-control" id="comment-textarea" rows="3"
                                          onChange={(e) => {this.changeReply(e)}}/>
                            </div>
                        </form>
                    </div>
                }
                footer={
                    <div className={"modal-footer"}>
                        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary" data-dismiss="modal"
                                disabled={!enabled}
                                onClick={(e) => {this.submitModalData(e, {root : this.state.root, content : this.state.content, parentID : this.state.parentID})}}>{this.state.root ? "Comment" : "Reply"}
                        </button>
                    </div>
                }
            />
        );
    }
}