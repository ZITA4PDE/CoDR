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

import classes.RightGroup;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchema;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;

public class RightGroupsTests extends CoDRTest {

    private static final Path RIGHT_GROUP_LIST_SCHEMA_PATH = Paths.get
            ("src/test/java/schemas/rightgroup/right-group-list.json");
    private static final Path RIGHT_GROUP_SCHEMA_PATH = Paths.get("src/test/java/schemas/rightgroup/right-group.json");

    private static final String VALID_RIGHT_GROUP = "{\"description\" : \"valid_rights_group " +
            "description\"}";
    private static final String INVALID_RIGHT_GROUP = "{\"krakaka\" : \"test\"}";

    private Integer testRightGroupId;

    @Before
    @After
    public void deleteTestRightGroup() {
        if (testRightGroupId != null) {
            given()
                    .headers(Util.DELETE_REQUEST_HEADER)
                    .delete(String.format("right_groups/%d", testRightGroupId));
        }
    }

    @Test
    public void rightGroupsGetTest() {
        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get("right_groups")
                .then()
                .assertThat()
                .body(matchesJsonSchema(RIGHT_GROUP_LIST_SCHEMA_PATH.toAbsolutePath().toUri()))
                .statusCode(200);
    }

    @Test
    public void validRightGroupPostTest() {
        testRightGroupId = staticValidRightGroupPostTest();
    }

    @Test
    public void invalidRightGroupPostTest() {
        given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(INVALID_RIGHT_GROUP)
                .post("right_groups")
                .then()
                .assertThat()
                .statusCode(405);
    }

    @Test
    public void validRightGroupPutTest() {
        validRightGroupPostTest();

        given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body("{\"description\" : \"new description\"}")
                .put(String.format("right_groups/%d", testRightGroupId))
                .then()
                .assertThat()
                .statusCode(200);

        List<RightGroup> groups = given()
                .headers(Util.GET_REQUEST_HEADER)
                .get("right_groups")
                .then()
                .extract()
                .jsonPath()
                .getList("$", RightGroup.class);

        for (RightGroup group : groups) {
            if (Objects.equals(group.id, testRightGroupId)) {
                assertThat(group.description, equalTo("new description"));
            }
        }

    }

    @Test
    public void invalidRightGroupPutTest() {
        validRightGroupPostTest();

        given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body("{\"description2\" : \"new description\"}")
                .put(String.format("right_groups/%d", testRightGroupId))
                .then()
                .assertThat()
                .statusCode(405);
    }

    @Test
    public void invalidRightGroupIdPutTest() {
        validRightGroupIdDeleteTest();
        given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body("{\"description\" : \"new description\"}")
                .put(String.format("right_groups/%d", testRightGroupId))
                .then()
                .assertThat()
                .statusCode(404);
    }

    @Test
    public void validRightGroupIdDeleteTest() {
        validRightGroupPostTest();

        given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .delete(String.format("right_groups/%d", testRightGroupId))
                .then()
                .assertThat()
                .statusCode(204);
    }

    @Test
    public void invalidRightGroupIdDeleteTest() {
        validRightGroupPostTest();

        validRightGroupIdDeleteTest();

        given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .delete(String.format("right_groups/%d", testRightGroupId))
                .then()
                .assertThat()
                .statusCode(404);

    }

    int staticValidRightGroupPostTest() {
        return given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(VALID_RIGHT_GROUP)
                .post("right_groups")
                .then()
                .assertThat()
                .body(matchesJsonSchema(RIGHT_GROUP_SCHEMA_PATH.toAbsolutePath().toUri()))
                .statusCode(201)
                .extract()
                .response()
                .getBody()
                .jsonPath()
                .getInt("id");
    }
}
