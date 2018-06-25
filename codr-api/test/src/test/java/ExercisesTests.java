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

public class ExercisesTests extends CoDRTest {

    private static final Integer TEST_RIGHTS_TEMPLATE_ID = 1;

    Integer moduleId;
    Integer courseId;
    Integer exerciseId;

    @Test
    public void validExercisePostTest() {
        CoursesTests coursesTests = new CoursesTests();
        coursesTests.validCoursePostTest();
        moduleId = coursesTests.moduleId;
        courseId = coursesTests.courseId;

        String exercise = "{\n" +
                "    \"rights_template_id\":" + TEST_RIGHTS_TEMPLATE_ID + " ,\n" +
                "    \"name\":\"test exercise\",\n" +
                "    \"description\":\"string\"\n" +
                "}";

        exerciseId = given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(exercise)
                .post(String.format("modules/%d/courses/%d/exercises", moduleId, courseId))
                .then()
                .assertThat()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getInt("id");
    }

    @Test
    public void invalidExercisePostTest() {
        String exercise = "{\n" +
                "    \"rights_template_id\":" + TEST_RIGHTS_TEMPLATE_ID + " ,\n" +
                "    \"name\":\"string\",\n" +
                "    \"description2\":\"string\"\n" +
                "}";

        given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(exercise)
                .post(String.format("modules/%d/courses/%d/exercises", moduleId, courseId))
                .then()
                .assertThat()
                .statusCode(400);
    }

    @Test
    public void validExerciseIdDeleteTest() {
        validExercisePostTest();

        given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .delete(String.format("modules/%d/courses/%d/exercises/%d", moduleId, courseId, exerciseId))
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void invalidExerciseIdDeleteTest() {
        validExerciseIdDeleteTest();

        given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .delete(String.format("modules/%d/courses/%d/exercises/%d", moduleId, courseId, exerciseId))
                .then()
                .assertThat()
                .statusCode(404);
    }

    @Test
    public void validExerciseIdGetTest() {
        validExercisePostTest();

        String name = given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("modules/%d/courses/%d/exercises/%d", moduleId, courseId, exerciseId))
                .then()
                .assertThat()
                .statusCode(200)
                .extract()
                .jsonPath()
                .getString("name");

        assertThat(name, equalTo("test exercise"));
    }

    @Test
    public void invalidExerciseIdGetTest() {
        validExerciseIdDeleteTest();

        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("modules/%d/courses/%d/exercises/%d", moduleId, courseId, exerciseId))
                .then()
                .assertThat()
                .statusCode(404);

    }

    @Test
    public void validExerciseGetTest() {
        validExercisePostTest();

        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("modules/%d/courses/%d/exercises", moduleId, courseId))
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void validExerciseIdPutTest() {
        validExercisePostTest();

        String exercise = "{\n" +
                "  \"name\": \"string\",\n" +
                "  \"description\": \"new put description\",\n" +
                "  \"rights_template_id\": 1\n" +
                "}";

        String name = given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body(exercise)
                .put(String.format("modules/%d/courses/%d/exercises/%d", moduleId, courseId, exerciseId))
                .then()
                .assertThat()
                .statusCode(200)
                .extract()
                .jsonPath()
                .getString("description");

        assertThat(name, equalTo("new put description"));
    }

    @Test
    public void invalidExerciseIdPutTest() {
        validExerciseIdDeleteTest();

        String exercise = "{\n" +
                "  \"name\": \"string\",\n" +
                "  \"description\": \"new put description\",\n" +
                "  \"rights_template_id\": 1\n" +
                "}";

        given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body(exercise)
                .put(String.format("modules/%d/courses/%d/exercises/%d", moduleId, courseId, exerciseId))
                .then()
                .assertThat()
                .statusCode(404);
    }

}
