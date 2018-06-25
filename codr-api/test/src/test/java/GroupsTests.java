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

import classes.User;
import org.junit.Test;

import java.util.List;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;

public class GroupsTests extends CoDRTest {

    private static final Integer VALID_MODULE_ID = 1;
    private static final Integer INVALID_GROUP_ID = 99;
    private Integer testGroupId;


    @Test
    public void validGroupPostTest() {
        String module = "{\n" +
                "    \"module_id\": " + VALID_MODULE_ID + "\n" +
                "  }";

        testGroupId = given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(module)
                .post("groups")
                .then()
                .assertThat()
                .statusCode(201)
                .extract()
                .response()
                .jsonPath()
                .getInt("id");
    }

    @Test
    public void invalidGroupPostTest() {
        String module = "{\n" +
                "    \"id\": 1\n" +
                "  }";

        given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(module)
                .post("groups")
                .then()
                .assertThat()
                .statusCode(405);

    }

    @Test
    public void validGroupGetTest() {
        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get("groups")
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void validGroupIdGetTest() {
        validGroupPostTest();

        Integer moduleID = given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("groups/%d", testGroupId))
                .then()
                .assertThat()
                .statusCode(200)
                .extract()
                .body()
                .jsonPath()
                .getInt("module_id");

        assertThat(moduleID, equalTo(VALID_MODULE_ID));
    }

    @Test
    public void invalidGroupIdGetTest() {
        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("groups/%d", INVALID_GROUP_ID))
                .then()
                .assertThat()
                .statusCode(404);
    }

    @Test
    public void validGroupIdDeleteTest() {
        validGroupPostTest();

        given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .delete(String.format("groups/%d", testGroupId))
                .then()
                .assertThat()
                .statusCode(204);

    }

    @Test
    public void invalidGroupIdDeleteTest() {
        given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .get(String.format("groups/%d", INVALID_GROUP_ID))
                .then()
                .assertThat()
                .statusCode(404);
    }

    @Test
    public void validGroupIdPutTest() {
        validGroupPostTest();

        String put = "\n" +
                "  [\n" +
                "    {\n" +
                "      \"id\": 0\n" +
                "    }\n" +
                "  ]\n" +
                "\n";

        List<User> users = given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body(put)
                .put(String.format("groups/%d", testGroupId))
                .then()
                .assertThat()
                .statusCode(200)
                .extract()
                .jsonPath()
                .getList("users", User.class);
        assertThat(users.get(0).id, equalTo(0));
    }

    @Test
    public void invalidGroupIdPutTest() {
        String put = "\n" +
                "\n" +
                "[\n" +
                "    {\n" +
                "      \"id\": 0\n" +
                "    }\n" +
                "  ]\n" +
                "\n";

        given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .body(put)
                .put(String.format("groups/%d", INVALID_GROUP_ID))
                .then()
                .assertThat()
                .statusCode(404);
    }

}
