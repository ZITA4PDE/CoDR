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

public class UsersTests extends CoDRTest {

    private static final Integer VALID_GET_TEST_USER_ID = 1;
    private static final Integer INVALID_TEST_USER_ID = 9;
    private static final Integer VALID_DELETE_TEST_USER_ID = 2;
    private static final Integer VALID_PUT_TEST_USER_ID = 3;

    @Test
    public void usersGetTest() {
        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get("users")
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void validUserIdGetTest() {
        String name = given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("users/%d", VALID_GET_TEST_USER_ID))
                .then()
                .assertThat()
                .statusCode(200)
                .extract()
                .response()
                .getBody()
                .jsonPath()
                .getString("display_name");

        assertThat(name, equalTo("normal test user1"));
    }

    @Test
    public void invalidUserIdGetTest() {
        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("users/%d", INVALID_TEST_USER_ID))
                .then()
                .assertThat()
                .statusCode(404);
    }

    @Test
    public void validUserIdDeleteTest() {
        given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .delete(String.format("users/%d", VALID_DELETE_TEST_USER_ID))
                .then()
                .assertThat()
                .statusCode(204);
    }

    @Test
    public void invalidUserIdDeleteTest() {
        given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .delete(String.format("users/%d", INVALID_TEST_USER_ID))
                .then()
                .assertThat()
                .statusCode(404);
    }

    @Test
    public void validUserIdPutTest() {
        given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body("{\n" +
                        "  \"display_name\": \"string\"\n" +
                        "}")
                .put(String.format("users/%d", VALID_PUT_TEST_USER_ID))
                .then()
                .assertThat()
                .statusCode(200);

        String name = given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("users/%d", VALID_PUT_TEST_USER_ID))
                .then()
                .assertThat()
                .statusCode(200)
                .extract()
                .response()
                .getBody()
                .jsonPath()
                .getString("display_name");

        assertThat(name, equalTo("string"));

    }

    @Test
    public void invalidUserIdPutTest() {
        given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body("{\n" +
                        "  \"display_name\": \"string\"\n" +
                        "}")
                .delete(String.format("users/%d", INVALID_TEST_USER_ID))
                .then()
                .assertThat()
                .statusCode(404);
    }
}
