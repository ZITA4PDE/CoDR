import React from 'react';
import ReactDOM from 'react-dom';
import {renderNav} from '../nav';
import {Templates} from './templates';
import {Groups} from './groups';

/**
 * Main controller of the admin page.
 * Creates the navigation items in the sidebar and keeps track of which view is active.
 */
class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //currently active view.
            active: 'groups', 
            //navigation items. These are coupled to views.
            navItems: { 
                groups: {
                    "text": "Groups"
                },
                templates: {
                    "text": "Right templates"
                },
            },
        },
        this.onChange = this.onChange.bind(this);
    }

    /**
     * Run the update also when component is created
     */
    componentDidMount() {
        this.componentDidUpdate();
    }

    /**
     * Keep track of which view is active in the state.
     * Called when a navigation item in the sidebar is clicked.
     */
    onChange(target) {
        this.setState({active: target});
    }

    /**
     * Render the navigation items in the sidebar
     */
    componentDidUpdate() {
        let navItems = JSON.parse(JSON.stringify(this.state.navItems));
        navItems[this.state.active].active = true;

        renderNav(navItems,this.onChange);
    }

    /**
     * Render the currently active view in the main-content div
     */
    render() {

        let output = {
            groups: <Groups/>,
            templates:<Templates/>,
        };

        return output[this.state.active];
    }
}


ReactDOM.render(<Main/>,document.getElementById('main-content'));
