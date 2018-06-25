module.exports = {
    api: "http://130.89.7.104:10010/api",
    api_request: {
        credentials: 'include',
        headers: {
            'accept': 'application/json',
        }
    },
    api_delete: {
        credentials: 'include',
        method: 'DELETE',
        headers: {
            'accept': 'application/json',
        }
    },
    api_post: {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    },
    api_put: {
        credentials: 'include',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        }
    },
    error_msg: "An error occurred fetching data",
    website: "http://130.89.7.104:3000",
    strings: {
        comment_header: " commented on ",
        no_messages: "No messages found",
        no_files: "No files found",
        project_users: "Projectgroup members",
        no_lines: 'Please select at least one line to comment',
        no_projectgroups: 'You have no project groups for this module',
        no_users: 'No users found',
    }
};
