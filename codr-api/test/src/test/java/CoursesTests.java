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

public class CoursesTests extends CoDRTest {

    Integer moduleId;
    Integer courseId;

    @Test
    public void validCoursePostTest() {
        ModulesTests modulesTests = new ModulesTests();
        modulesTests.validModulesPostTest();
        moduleId = modulesTests.moduleId;

        String course = "{\n" +
                "  \"name\": \"example course\",\n" +
                "  \"description\": \"example course description\"\n" +
                "}";

        courseId = given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(course)
                .post(String.format("modules/%d/courses", moduleId))
                .then()
                .assertThat()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getInt("id");
    }

    @Test
    public void invalidCoursePostTest() {
        String course = "{\n" +
                "  \"name\": \"example course\",\n" +
                "  \"description2\": \"example course description\"\n" +
                "}";

        given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(course)
                .post(String .format("modules/%d/courses", moduleId))
                .then()
                .assertThat()
                .statusCode(400);
    }

    @Test
    public void validCoursesGetTest() {
        validCoursePostTest();

        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("modules/%d/courses", moduleId))
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void validCoursesIdGetTest() {
        validCoursePostTest();

        String name = given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("modules/%d/courses/%d", moduleId, courseId))
                .then()
                .assertThat()
                .statusCode(200)
                .extract()
                .jsonPath()
                .getString("name");

        assertThat(name, equalTo("example course"));
    }

    @Test
    public void invalidCoursesIdGetTest() {
        validCourseIdDeleteTest();
        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("modules/%d/courses/%d", moduleId, courseId))
                .then()
                .assertThat()
                .statusCode(404);
    }

    @Test
    public void validCourseIdDeleteTest() {
        validCoursePostTest();

        given()
                .headers(Util.POST_REQUEST_HEADER)
                .delete(String.format("modules/%d/courses/%d", moduleId, courseId))
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void invalidCourseIdDeleteTest() {
        validCourseIdDeleteTest();

        given()
                .headers(Util.POST_REQUEST_HEADER)
                .delete(String.format("modules/%d/courses/%d", moduleId, courseId))
                .then()
                .assertThat()
                .statusCode(404);

    }

    @Test
    public void validCoursePutTest() {
        validCoursePostTest();

        String put = "{\n" +
                "  \"name\": \"test put name\",\n" +
                "  \"description\": \"string\"\n" +
                "}";

        String name = given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body(put)
                .put(String.format("modules/%d/courses/%d", moduleId, courseId))
                .then()
                .assertThat()
                .statusCode(200)
                .extract()
                .jsonPath()
                .getString("name");

        assertThat(name, equalTo("test put name"));
    }

    @Test
    public void invalidCoursePutTest() {
        validCourseIdDeleteTest();

        String put = "{\n" +
                "  \"name\": \"test put name\",\n" +
                "  \"description\": \"string\"\n" +
                "}";

        given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body(put)
                .put(String.format("modules/%d/courses/%d", moduleId, courseId))
                .then()
                .assertThat()
                .statusCode(404);

    }

}
