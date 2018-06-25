import React from 'react';
import {EditButton, ExerciseForm, HeaderButton, SaveButton} from "../objects";
import {params_to_url} from "../helpers";
import * as config from "../config";

/**
 * Settings for exercise
 */
export class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            exercise: this.props.exercise,
            isLoading: true,
            editing: false,
        };
        this.editExercise = this.editExercise.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    /**
     * Send PUT request to API
     * Called when exercise is saved after editing
     */
    editExercise() {
        let {params} = this.props;
        let url = config.api + params_to_url(params.module_id,params.course_id,params.exercise_id);
        let request = config.api_put;
        this.state.exercise.rights_template_id = parseInt(this.state.exercise.rights_template_id);
        let exercise = JSON.parse(JSON.stringify(this.state.exercise));
        //Remove fields that are not needed by server.
        delete exercise.projects;
        delete exercise.can_edit;
        request.body = JSON.stringify(exercise);
        console.log(request.body);
        fetch(url,request)
            .then(response => {
                if (response.ok) {
                    alert('success');
                    this.setState({editing: false});
                    this.props.refresh(); //refresh content
                } else {
                    throw new Error();
                }
            }).catch(e => {
                alert('fail');
        })
    }

    /**
     * Update exercise data in state when inputs in the form change.
     * @param {boolean} update - indicates if the component should be updated.
     */
    handleChange(e, update=true) {
        let {exercise} = this.state;
        exercise[e.target.name] = e.target.value;
        if (update) this.setState({exercise: exercise});
    }

    render() {
        let {exercise} = this.state;
        let {can_edit} = exercise;

        let header = <h1>Settings</h1>;
        if (can_edit) {
            header = <HeaderButton main={header} button={
                this.state.editing ?
                    <SaveButton onClick={this.editExercise}/>:
                <EditButton onClick={e => this.setState({editing: true})}/>}
            />
        }

        return (
            <div>
                {header}
                <ExerciseForm editing={this.state.editing}
                              exercise={exercise}
                              onChange={this.handleChange}
                />
            </div>
        )

    }
}
