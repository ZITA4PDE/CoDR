/**
 * general purpose helper functions
 */
import config from "./config";

/**
 * Create an url based on the given path parameters
 */
export function params_to_url(module_id = null, course_id = null, exercise_id = null, project_id = null, file_id = null, comment_id = null) {
    let url = "";
    if (module_id) {
        url += '/modules/' + module_id;
    }
    if (course_id) {
        url += '/courses/' + course_id;
    }
    if (exercise_id) {
        url += '/exercises/' + exercise_id;
    }
    if (project_id) {
        url += '/projects/' + project_id;
    }
    if (file_id) {
        url += '/files/'+file_id;
    }
    if (comment_id) {
        url += '/comments/' + comment_id;
    }
    return url;
}

/**
 * Check if user is authorized and if the response is okay.
 * Returns the json data of the response.
 */
export function handleJSONResponse(response) {
    if (response.status === 401) {
        //Not logged in or not authorized
        //redirect to login endpoint
        window.location.href = config.api + "/login";
    }

    if (response.ok) {
        return response.json();
    } else {
        throw new Error;
    }
}

/**
 * Get the parameters attribute of the react-script element.
 * This is used to find the path parameters of the current url so that a request can be sent to the correct location.
 */
export function getParams() {
    return JSON.parse(document.getElementById('react-script').getAttribute("params"));
}

/**
 * Send a DELETE request to the API to delete a comment.
 * @param {object} comment - comment to be deleted.
 * @param {function} refresh - function that should be called to refresh the content of the current page.
 */
export function removeComment(comment,refresh = false) {

    let request = config.api_delete;
    let link = params_to_url(comment.module_id,comment.course_id,comment.exercise_id,comment.project_id,comment.file_id);
    link += '/comments/' + comment.id;

    fetch(config.api + link,request)
        .then(response => {
            if(response.ok) {
                alert('Comment deleted');
                if (refresh) {
                    refresh();
                }
            }
        }).catch(e => {
            alert(e);
        });
}

/**
 * Convert a timestamp to a date and time string.
 */
export function timestampToDate(timestamp) {
    //timestamp = Math.round(+new Date());
    timestamp = new Date(parseInt(timestamp));
    let isostring = timestamp.toISOString();
    return isostring.substring(0,10) + ' at ' + isostring.substring(11,19);
}

/**
 * Get a given element of the cookie.
 * @param {string} cname - name of the cookie field.
 */
export function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

/**
 * Send a PUT request to the API to update the visibility of a comment.
 * @param {object} comment - comment of which the visibility should be toggled.
 * @param {function} refresh - function that should be called to refresh the content of the current page.
 */
export function toggleVisibility(comment,refresh=false) {
    let url = config.api + params_to_url(comment.module_id,comment.course_id,comment.exercise_id,comment.project_id,comment.file_id) 
        + '/comments/' + comment.id;
    let request = config.api_put;
    request.body = JSON.stringify({
        content: comment.content,
        visible: !comment.visible,
    });

    fetch(url,request)
        .then(response => {
            if (response.ok) {
                alert('Visibility updated');
                if (refresh) {
                    refresh();
                }
            } else {
                throw new Error();
            }
        }).catch(e => {
            console.log(e);
            alert('Updating visibility failed');
        });
}
