import React from "react";

/**
 * Bootstrap breadcrumb
 */
export class BreadCrumb extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            path : this.props.path
        }
    }

    /**
     * Transform the path from the state to breadcrumb format
     */
    parsePath() {
        let path;
        path = this.state.path.split("/");
        let pathElements = [];

        for (let i = 0; i < path.length; i++) {
            pathElements.push(
                <li key={"breadcrumb-" + i} className={"breadcrumb-item active"}>{path[i]}</li>

            )
        }

        return pathElements;
    }

    render() {
        return (
            <ol className={"breadcrumb"}>
                {this.parsePath()}
            </ol>
        );
    }
}

