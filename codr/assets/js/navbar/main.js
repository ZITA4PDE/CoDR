import React from "react";
import ReactDOM from "react-dom";
import config from "../config";
import {getCookie, handleJSONResponse} from "../helpers";
import {ErrorDisplay, Loader} from "../objects";

/**
 * Username field in the navbar
 */
class Profile extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            //Information of the current user
            name : null,
            id : null,
            userLevel : null,

            isLoading : true,
            error : null,
        }
    }

    /**
     * Set the given name and value in the cookie.
     * @param {string} cname - name of the field.
     * @param {string} cvalue - value of the cookie field.
     */
    static setCookie(cname, cvalue) {
        let d = new Date();
        d.setTime(d.getTime() + 3600*1000);
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    /**
     * Fetch user information from the API if it is not already stored in the cookie.
     */
    componentDidMount() {
        let apiString = config.api + "/users/current";

        let usernameCookie = getCookie("username");
        let idCookie = getCookie("id");
        let userLevelCookie = getCookie("user_level");

        if (usernameCookie && idCookie && userLevelCookie) {
            this.setState({name : usernameCookie, id : idCookie, userLevel : userLevelCookie, isLoading : false});
        } else {
            fetch(apiString, config.api_request)
                .then(handleJSONResponse)
                .then(data => {
                        Profile.setCookie("username", data.display_name);
                        Profile.setCookie("id", data.id);
                        Profile.setCookie("user_level", data.user_level);
                        this.setState({
                            name : data.display_name,
                            id : data.id,
                            userLevel : data.user_level,
                            isLoading : false,
                        })
                    }
                )
                .catch(error => this.setState({error : error, isLoading : false}));
        }



    }

    render() {
        if (this.state.isLoading) {
            return <Loader/>;
        }

        if (this.state.error) {
            return <ErrorDisplay error={this.state.error}/>
        }

        return (
            this.state.name
        )
    }
}

/**
 * Render the navigation items in the navigation bar.
 */
class NavItems extends React.Component {
    render() {
        let items = [];
        let user_level = getCookie('user_level');
        items.push(<li key={'modules'} className={"nav-item"}><a className={"nav-link"} href={"/modules"}>Modules</a></li>);
        if (user_level === '0') {
            items.push(<li key={'admin'} className={"nav-item"}><a className={"nav-link"} href={'/admin'}>Admin</a></li>);
        }
        return items;
    }
}

ReactDOM.render(<Profile/>, document.getElementById('profile'));
ReactDOM.render(<NavItems/>,document.getElementById('navbarItems'));
