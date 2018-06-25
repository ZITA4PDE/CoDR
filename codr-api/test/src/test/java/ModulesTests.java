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

public class ModulesTests extends CoDRTest {

    Integer moduleId;

    @Test
    public void validModulesGetTest() {
        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get("modules")
                .then()
                .assertThat()
                .statusCode(200)
                .extract()
                .jsonPath();
    }

    @Test
    public void validModulesPostTest() {
        String module = "{\n" +
                "    \"name\":\"test module\",\n" +
                "    \"description\":\"test module description\"\n" +
                "}";

        moduleId = given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(module)
                .post("modules")
                .then()
                .assertThat()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getInt("id");
    }

    @Test
    public void invalidModulesPostTest() {
        String module = "{\n" +
                "    \"name\":\"test module\",\n" +
                "    \"description2\":\"test module description\"\n" +
                "}";

        given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(module)
                .post("modules")
                .then()
                .assertThat()
                .statusCode(405);
    }

    @Test
    public void validModuleIdGetTest() {
        validModulesPostTest();

        Integer id = given()
                .headers(Util.POST_REQUEST_HEADER)
                .get(String.format("modules/%d", moduleId))
                .then()
                .assertThat()
                .statusCode(200)
                .extract()
                .jsonPath()
                .getInt("id");

        assertThat(id, equalTo(moduleId));
    }

    @Test
    public void invalidModuleIdGetTest() {
        validModuleIdDeleteTest();

        given()
                .headers(Util.POST_REQUEST_HEADER)
                .get(String.format("modules/%d", moduleId))
                .then()
                .assertThat()
                .statusCode(404);
    }

    @Test
    public void validModuleIdDeleteTest() {
        validModulesPostTest();

        given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .delete(String.format("modules/%d", moduleId))
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void invalidModuleIdDeleteTest() {
        validModuleIdDeleteTest();

        given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .delete(String.format("modules/%d", moduleId))
                .then()
                .assertThat()
                .statusCode(404);
    }

    @Test
    public void validModuleIdPutTest() {
        validModulesPostTest();

        String module = "{\n" +
                "    \"name\":\"test put\",\n" +
                "    \"description\":\"string\"\n" +
                "}";

        String name = given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body(module)
                .put(String.format("modules/%d", moduleId))
                .then()
                .assertThat()
                .statusCode(200)
                .extract()
                .jsonPath()
                .getString("name");

        assertThat(name, equalTo("test put"));
    }

    @Test
    public void invalidModuleIdPutTest() {
        validModuleIdDeleteTest();

        String module = "{\n" +
                "    \"name\":\"test put\",\n" +
                "    \"description\":\"string\"\n" +
                "}";

        given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body(module)
                .put(String.format("modules/%d", moduleId))
                .then()
                .assertThat()
                .statusCode(404);

    }

    @Test
    public void invalidModulePutTest() {
        validModulesPostTest();

        String module = "{\n" +
                "    \"name\":\"test put\",\n" +
                "    \"description2\":\"string\"\n" +
                "}";

        given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body(module)
                .put(String.format("modules/%d", moduleId))
                .then()
                .assertThat()
                .statusCode(405);
    }

    @Test
    public void validModuleIdGroupGetTest() {
        validModulesPostTest();

        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("modules/%d/group", moduleId))
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void invalidModuleIdGroupGetTest() {
        validModuleIdDeleteTest();
        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("modules/%d/group", moduleId))
                .then()
                .assertThat()
                .statusCode(404);
    }

}
