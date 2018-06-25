import React from 'react';
import ReactDOM from 'react-dom';

import config from "../config";
import {CommentList} from "../comments";
import {renderNav} from "../nav";
import {handleJSONResponse,getCookie} from "../helpers";
import {ErrorDisplay, Loader, NavTabs} from "../objects";

/**
 * Main profile view
 */
class ProfileView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            error: null,
            comments: [],
            //Currently active view
            active: "profile",
            //Navigation items. These are coupled to views.
            navItems: {
                profile: {
                    "text": "Latest Messages"
                },
                /*settings: {
                    "text": "Settings",
                }*/
            }
        }

        this.componentDidMount = this.componentDidMount.bind(this);
    }

    /**
     * Fetch the comments for the current user from the API
     */
    componentDidMount() {
        this.setState({isLoading: true});

        let id = getCookie("id");

        let url = config.api + "/users/current/comments";
        fetch(url, config.api_request)
            .then(handleJSONResponse)
            .then(data => {
                this.setState({
                    comments: data,
                })
            }).catch(error => {
            console.log(error);
            this.setState({error: new Error('while loading messages')});
        });
        this.setState({isLoading: false});
    }

    /**
     * Update the navigation items in the sidebar when component updates
     */
    componentDidUpdate() {
        let navItems = JSON.parse(JSON.stringify(this.state.navItems));
        navItems[this.state.active].active = true;

        renderNav(navItems);
    }

    render() {
        if (this.state.isLoading) {
            return <Loader/>
        }

        if (this.state.error) {
            return <ErrorDisplay error={this.state.error}/>
        }
        return (
            <div>
                <NavTabs active={this.state.active}
                         divs={{
                    profile: {
                        content: <CommentList
                            comments={this.state.comments}
                            refresh={this.componentDidMount}
                            button={true}/>
                    },
                    settings: {
                        content: <h1>Settings</h1>
                    }
                }}/>
            </div>
        )
    }
}

ReactDOM.render(<ProfileView/>,document.getElementById('main-content'));
