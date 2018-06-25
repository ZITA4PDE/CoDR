/**
 * Render navigation items in the sidebar
 */
import React from 'react';
import ReactDOM from 'react-dom';

class ListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: props.active
        }
    }

    /**
     * Update the state if the active prop changes.
     */
    componentWillReceiveProps(nextProps) {
        if (this.state.active !== nextProps.active) {
            this.setState({active: nextProps.active});
        }
    }

    render() {
        let className = "nav-link";
        if (this.state.active) {
            className += " active show";
        }

        return (
            <a className={className}
               data-toggle={"pill"}
               role="tab"
               aria-controls={this.props.target}
               aria-selected={this.state.active ? "true" : "false"}
               href={'#' + this.props.target} onClick={() => this.props.onClick(this.props.target)}>{this.props.text}</a>
        )
    }
}

export class NavList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list_items: props.list_items
        };
        this.changeActive = this.changeActive.bind(this);
    }

    /**
     * Change which target is active.
     * Called when navigation item is clicked.
     * @param {string} target - the name of the view that should become active.
     */
    changeActive(target) {
        //Make all items inactive.
        for (let t in this.state.list_items) {
            let item=this.state.list_items[t];
            item.active = false;
        }
        //Make the correct item active.
        this.state.list_items[target].active = true;
        //Update the state.
        this.setState(this.state);
        //Update the parent.
        if (this.props.onChange) this.props.onChange(target);
    }

    /**
     * Update the state if list_items prop changes.
     */
    componentWillReceiveProps(nextProps) {
        this.setState({list_items: nextProps.list_items});
    }

    render() {
        //Create an array of list items
        let list_items = [];
        let i=0;

        for (let target in this.state.list_items) {
            let item = this.state.list_items[target];
            list_items.push(
                <ListItem key={i} onClick={this.changeActive} target={target} text={item.text} active={item.active}/>
            );
            i++;
        }

        return (
            <div className={"nav nav-pills flex-column"} aria-orientation="vertical" id={"nav_list"} role={"tablist"} >
                {list_items}
            </div>
        )
    }
}

/**
 * Render the nav items in the sidebar.
 * This function is called by scripts that control the main content of a react_sidebar view.
 */
module.exports.renderNav = function(navItems, onChange) {
    ReactDOM.render(<NavList list_items={navItems} onChange={onChange}/>, document.getElementById('sidebar'));
};


module.exports.ListItem = ListItem;
module.exports.NavList = NavList;
