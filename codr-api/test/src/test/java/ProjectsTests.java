/*
 * Copyright (c) 2018, Joost Prins <github.com/joostprins>, Tom Leemreize <https://github.com/oplosthee>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import org.junit.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;

public class ProjectsTests extends CoDRTest {

    Integer moduleId;
    Integer courseId;
    Integer exerciseId;
    Integer projectId;

    @Test
    public void validProjectPostTest() {
        ExercisesTests exercisesTests = new ExercisesTests();
        exercisesTests.validExercisePostTest();
        moduleId = exercisesTests.moduleId;
        courseId = exercisesTests.courseId;
        exerciseId = exercisesTests.exerciseId;
        String project = "{\n" +
                "    \"projectgroup_id\": 1\n" +
                "}";

        projectId = given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(project)
                .post(String.format("modules/%d/courses/%d/exercises/%d/projects", moduleId, courseId, exerciseId))
                .then()
                .assertThat()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getInt("id");
    }

    @Test
    public void invalidProjectPostTest() {
        validProjectPostTest();

        String project = "{\n" +
                "    \"projectgroup_id1\":0\n" +
                "}";

        given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(project)
                .post(String.format("modules/%d/courses/%d/exercises/%d/projects", moduleId, courseId, exerciseId))
                .then()
                .assertThat()
                .statusCode(405);
    }

    @Test
    public void validProjectIdDeleteTest() {
        validProjectPostTest();

        given()
                .headers(Util.POST_REQUEST_HEADER)
                .delete(String.format("modules/%d/courses/%d/exercises/%d/projects/%d", moduleId, courseId,
                        exerciseId, projectId))
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void invalidProjectIdDeleteTest() {
        validProjectIdDeleteTest();

        given()
                .headers(Util.POST_REQUEST_HEADER)
                .delete(String.format("modules/%d/courses/%d/exercises/%d/projects/%d", moduleId, courseId,
                        exerciseId, projectId))
                .then()
                .assertThat()
                .statusCode(404);
    }

    @Test
    public void validProjectGetTest() {
        validProjectPostTest();

        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("modules/%d/courses/%d/exercises/%d/projects/", moduleId, courseId, exerciseId))
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void validProjectIdGetTest() {
        validProjectPostTest();

        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("modules/%d/courses/%d/exercises/%d/projects/%d", moduleId, courseId, exerciseId,
                        projectId))
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void invalidProjectIdGetTest() {
        validProjectIdDeleteTest();

        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("modules/%d/courses/%d/exercises/%d/projects/%d", moduleId, courseId, exerciseId,
                        projectId))
                .then()
                .assertThat()
                .statusCode(404);
    }

    @Test
    public void validProjectIdPutTest() {
        validProjectPostTest();

        String project = "{\n" +
                "    \"projectgroup_id\": 1\n" +
                "}";

        Integer projectGroupId = given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body(project)
                .put(String.format("modules/%d/courses/%d/exercises/%d/projects/%d", moduleId, courseId, exerciseId,
                        projectId))
                .then()
                .assertThat()
                .statusCode(200)
                .extract()
                .jsonPath()
                .getInt("projectgroup_id");

        assertThat(projectGroupId, equalTo(1));
    }

    @Test
    public void invalidProjectIdPutTest() {
        validProjectIdDeleteTest();

        String project = "{\n" +
                "    \"projectgroup_id\": 1\n" +
                "}";

        given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body(project)
                .put(String.format("modules/%d/courses/%d/exercises/%d/projects/%d", moduleId, courseId, exerciseId,
                        projectId))
                .then()
                .assertThat()
                .statusCode(404);
    }

}
