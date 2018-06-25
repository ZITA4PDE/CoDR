import React from 'react';
import ReactDOM from 'react-dom';
import {renderNav} from '../nav';
import config from '../config';
import {params_to_url, handleJSONResponse, getParams} from '../helpers';
import {ExerciseForm} from "../objects";
import {SaveButton, MCForm, Modal, CreateButton, HeaderButton, Loader, ErrorDisplay, DeleteButton} from "../objects";

let params = getParams();
let {module_id,course_id} = params;

let modalID = "createExercise";

/**
 * Main view of a course
 */
class CourseView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            error: null,
            course: null,
            //Currently active view
            active: 'exercises',
            //navigation items. These are coupled to views.
            navItems: {
                exercises: {
                    "text": "Exercises"
                },
                /*settings: {
                    "text": "Settings"
                },*/
            }
        };

        this.componentDidMount = this.componentDidMount.bind(this);
    }

    /**
     * Fetch course information from API
     */
    componentDidMount() {
        let {module_id,course_id} = params;
        let url = config.api + params_to_url(module_id,course_id);
        fetch(url, config.api_request)
            .then(handleJSONResponse)
            .then(json => {
                this.setState({
                    course: json,
                    isLoading: false,
                    postSuccess: null,
                });
            }).catch(e => {
            this.setState({error: new Error('while loading course'), isLoading: false})
        });
    }

    /**
     * Update the nav items in the sidebar when the course information changes.
     */
    componentDidUpdate() {
        if (this.state.course) {
            let navItems = JSON.parse(JSON.stringify(this.state.navItems));
            if (!this.state.course.can_edit) {
                delete navItems.settings;
            }
            navItems[this.state.active].active = true;

            renderNav(navItems);
        }
    }

    render() {
        if (this.state.isLoading) {
            return (
                <Loader/>
            )
        }
        if (this.state.error) {
            return <ErrorDisplay error={this.state.error}/>
        }

        return (
            <div>
                <div className={"jumbotron"}>
                    <h1>{this.state.course.name}</h1>
                    <p>{this.state.course.description}</p>
                </div>
                <div className={"tab-content"}>
                    <div className={"tab-pane fade show active"} id={"exercises"} role={"tabpanel"} aria-labelledby="exercises-tab">
                        <Exercises
                            refresh={this.componentDidMount}
                            course={this.state.course}/>
                    </div>
                    <div className={"tab-pane fade"} id={"settings"} role={"tabpanel"} aria-labelledby="settings-tab">
                        <h1>Settings</h1>
                    </div>
                </div>
            </div>
        )
    }
}

class Exercise extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deleted: false,
        };
        this.deleteExercise = this.deleteExercise.bind(this);
    }

    /**
     * Send DELETE request to API
     * Called when user clicks the delete button
     * @param {int} id - exercise id
     */
    deleteExercise(id) {
        let url = config.api + params_to_url(module_id, course_id,id);
        fetch(url,config.api_delete)
            .then(response => {
                if (response.ok) {
                    alert('success');
                    this.setState({deleted: true});
                } else {
                    throw new Error();
                }
            }).catch(e => {
                alert('fail');
        })
    }

    render() {
	if (this.state.deleted) {
	    return null;
	}
        let {exercise,can_edit} = this.props;

        let header = exercise.name;
        if (can_edit) {
            header = <HeaderButton main={header} button={<DeleteButton onClick={e => {
                this.deleteExercise(exercise.id);
            }}/>}/>
        }
        return (
            <div id={exercise.id} className={"card top-margin clickable"} onClick={() => this.handleClick(exercise.id)}>
                <div className={"card-header"}>
                    {header}
                </div>
                <div className={"card-body"}>
                    {exercise.description}
                </div>
            </div>
        )
    }

    /**
     * Go to the exercise page when the exercise is clicked.
     * Called when user clicks on the exercise
     * @param {int} exercise_id - id of the exercise that was clicked
     */
    handleClick(exercise_id) {
        window.location.href = config.website + params_to_url(params.module_id,params.course_id,exercise_id);
    }
}

/**
 * List of exercises
 */
class Exercises extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            error: null,
            form: {},
            isPosting: false,
            postSuccess: null,
        };

        this.handleChange = this.handleChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.updateForm = this.updateForm.bind(this);
    }

    /**
     * Update the form in the state when the information in the exercise creation form is changed
     */
    handleChange(e) {
        this.state.form[e.target.name] = e.target.value;
    }

    /**
     * Set the initial value for the exercise form
     */
    updateForm(form) {
        this.setState({form: form});
    }

    /**
     * Send POST request to the API to create an exercise
     * Use the form field in the state as the body of the request.
     */
    onFormSubmit(e) {
        e.preventDefault();
        this.setState({isPosting: true});
        let url = config.api + params_to_url(module_id,course_id) + "/exercises";
        let request = config.api_post;
        let {form} = this.state;
        form.rights_template_id = parseInt(form.rights_template_id);
        request.body= JSON.stringify(form);
        console.log(request.body);
        fetch(url, request)
            .then(response => {
            if (response.ok) {
                this.setState({postSuccess: true})
            } else {
                throw new Error;
            }
        }).catch(e => {
            this.setState({isPosting: false});
        });
        this.setState({isPosting: false});
    }

    render() {
        if (this.state.error) {
            return (
                <ErrorDisplay error={this.state.error}/>
            );
        }

        let {course} = this.props;
        document.title = course.name;
        //Create list of exercises
        let exercises = [];
        course.exercises.forEach(exercise => {
            exercises.push(<Exercise key={exercise.id} exercise={exercise} can_edit={course.can_edit}/>)
        });
        if (!exercises.length) {
            exercises = <p>There are no exercises for this course.</p>;
        }

        let header =<h1>Exercises</h1>;

        if (course.can_edit) {
            header = <HeaderButton
                main={header} button={<CreateButton dataToggle={"modal"} dataTarget={modalID}/>}
            />
        }

        let postStatus = this.state.isPosting ? <Loader/> :
            <h1>{this.state.postSuccess ? "Exercise successfully created" : "Exercise creation failed"}</h1>;

        return (
            <div>
                {header}
                <div id="exercises">
                    {exercises}
                </div>
                {course.can_edit ?
                    <form id="exerciseCreateForm" onSubmit={this.onFormSubmit}>
                        <Modal  id={modalID}
                                header={
                                    <div className={"modal-header"}>
                                        <h1>Create Exercise</h1>
                                    </div>
                                }
                                body={
                                    this.state.postSuccess !== null ?
                                        postStatus
                                        : <div className={"modal-body"}>
                                            <ExerciseForm editing={true} onChange={this.handleChange} updateForm={this.updateForm}/>
                                        </div>}
                                footer={
                                    <div className={"modal-footer"}>
                                        <button type="button"
                                                className="btn btn-secondary"
                                                data-dismiss="modal"
                                                onClick={this.props.refresh}>Close</button>
                                        {this.state.postSuccess === null ? <SaveButton submit/> : null}
                                    </div>}
                        />
                    </form>: null}
            </div>
        )
    }
}

ReactDOM.render(<CourseView/>,document.getElementById('main-content'));
