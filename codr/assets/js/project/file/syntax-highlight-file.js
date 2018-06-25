import React from "react";
import {github} from "react-syntax-highlighter/styles/hljs";
import {recursiveCommentHighlight} from "./comment-feed";
import SyntaxHighlighter from 'react-syntax-highlighter';

import '../../../stylesheets/file.scss';
import {Checkbox, CheckboxGroup} from "react-checkbox-group";

const customStyleProperties = {"background": "#ffffff", "display" : "inline",
    "float": "none", "padding" : "0.1rem"};
const customCodeTagProps = {"style" : {"float": "none"}};

class CodeLine extends React.Component {
    render() {
        return (
            <SyntaxHighlighter language={'java'} style={github} customStyle={customStyleProperties}
                               codeTagProps={customCodeTagProps}>
                {this.props.code}
            </SyntaxHighlighter>
        );
    }
}

export class FullFile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lines : props.lines,
            commentDictionary : props.commentDictionary,
            updateCheckBoxLines : props.updateCheckBoxLines,
            can_comment : props.can_comment,
        };
        this.updateCheckBoxLines = this.state.updateCheckBoxLines.bind(this);
        this.onMouse = this.onMouse.bind(this);
    }

    /**
     * Method that gets called every time the state of the parent changes.
     * @param nextProps updated props of the component.
     */
    componentWillReceiveProps(nextProps) {
        this.setState({commentDictionary: nextProps.commentDictionary});
    }

    /**
     * Helper method to update the background of a line when the mouse hovers into or out of the line.
     * @param line line number to highlight
     * @param commentList list of comments to highlight.
     * @param highlight boolean to indicate if the hover is on the element or away from the element.
     */
    onMouse(line, commentList, highlight) {

        const lineColor = highlight ? "rgba(255, 255, 0)" : "rgba(255, 255, 255)";

        const commentColor = highlight ? "rgba(255, 255, 0, 0.2)" : "rgba(255, 255, 255)";

        if (commentList) {
            let element = document.getElementById("comment-line-" + line);

            if (element) {
                element.firstElementChild.style.background = lineColor;

                for (let i = 0; i < commentList.length; i++) {
                    let commentID = commentList[i];

                    let element = document.getElementById("comment-" + commentID);

                    if (element) {
                        recursiveCommentHighlight(element, commentColor, true);
                    }
                }
            }
        }
    }

    render() {
        let {lines,can_comment} = this.state;
        let tableData = [];

        for (let i = 0; i < lines.length; i++) {
            let style;

            if ((i + 1) in this.state.commentDictionary) {
                style = {"background" : "rgba(255, 255, 0)"}
            }

            tableData.push(
                <tr key={"table-row-" + i}>
                    {can_comment ?
                    <td key={"checkbox-" + (i + 1)} id={"checkbox-" + (i + 1)} className={"checkbox"}>
                        <label className="form-check-label">
                            <Checkbox value={i + 1}/>
                        </label>
                    </td> : null}
                    <td key={"line-number-" + (i + 1)} className={"line-number"} style={style}>{i + 1}</td>
                    <td key={"comment-line-" + (i + 1)} id={"comment-line-" + (i + 1)} onMouseEnter={() => this.onMouse(i + 1, this.state.commentDictionary[i + 1], true)}
                        onMouseLeave={() => this.onMouse(i + 1, this.state.commentDictionary[i + 1], false)}><CodeLine code={lines[i]}/></td>
                </tr>
            );
        }

        return (
            <CheckboxGroup
                checkboxDepth={6}
                name={"lines"}
                onChange={this.state.updateCheckBoxLines}
            >
                <table className={"ml-2"}>
                    <tbody id="code-lines">
                            {tableData}
                    </tbody>
                </table>
            </CheckboxGroup>
        );
    }
}
