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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.nio.file.Path;
import java.nio.file.Paths;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchema;

public class TemplatesTests extends CoDRTest {

    private static final Path TEMPLATE_LIST_SCHEMA_PATH = Paths.get
            ("src/test/java/schemas/rightgroup/right-group-list.json");
    private static final Path TEMPLATE_SCHEMA_PATH = Paths.get("src/test/java/schemas/rightgroup/right-group.json");

    private static final String INVALID_TEMPLATE = "{\"name2\" : \"test\"}";

    private Integer templateId = 2;
    private Integer rightGroupId = 1;
    private String validPostTemplate;
    private String validPutTemplate;

    @Before
    public void getValidTemplate() {
        String postTemplate = "{\n" +
                "  \"name\": \"string\",\n" +
                "  \"rights\": [{\n" +
                "    \"id\": %d,\n" +
                "    \"description\": \"string\",\n" +
                "    \"project_rights\": {\n" +
                "      \"members\": {\n" +
                "        \"can_view\": true,\n" +
                "        \"can_edit\": true,\n" +
                "        \"can_create_comment\": true,\n" +
                "        \"can_create_visible_comment\": true,\n" +
                "        \"can_delete\": true\n" +
                "      },\n" +
                "      \"other\": {\n" +
                "        \"can_view\": true,\n" +
                "        \"can_edit\": true,\n" +
                "        \"can_create_comment\": true,\n" +
                "        \"can_create_visible_comment\": true,\n" +
                "        \"can_delete\": true\n" +
                "      }\n" +
                "    },\n" +
                "    \"comment_rights\": {\n" +
                "      \"owner\": {\n" +
                "        \"can_view\": true,\n" +
                "        \"can_edit\": true,\n" +
                "        \"can_delete\": true,\n" +
                "        \"can_toggle_visibility\": true\n" +
                "      },\n" +
                "      \"member\": {\n" +
                "        \"can_view\": true,\n" +
                "        \"can_edit\": true,\n" +
                "        \"can_delete\": true,\n" +
                "        \"can_toggle_visibility\": true\n" +
                "      },\n" +
                "      \"other\": {\n" +
                "        \"can_view\": true,\n" +
                "        \"can_edit\": true,\n" +
                "        \"can_delete\": true,\n" +
                "        \"can_toggle_visibility\": true\n" +
                "      }\n" +
                "    }\n" +
                "  }]\n" +
                "}";

        String putTemplate = "{\n" +
                "  \"id\": %d,\n" +
                "  \"description\": \"string\",\n" +
                "    \"project_rights\": {\n" +
                "      \"members\": {\n" +
                "        \"can_view\": true,\n" +
                "        \"can_edit\": true,\n" +
                "        \"can_create_comment\": true,\n" +
                "        \"can_create_visible_comment\": true,\n" +
                "        \"can_delete\": true\n" +
                "      },\n" +
                "      \"other\": {\n" +
                "        \"can_view\": true,\n" +
                "        \"can_edit\": true,\n" +
                "        \"can_create_comment\": true,\n" +
                "        \"can_create_visible_comment\": true,\n" +
                "        \"can_delete\": true\n" +
                "      }\n" +
                "    },\n" +
                "    \"comment_rights\": {\n" +
                "      \"owner\": {\n" +
                "        \"can_view\": true,\n" +
                "        \"can_edit\": true,\n" +
                "        \"can_delete\": true,\n" +
                "        \"can_toggle_visibility\": true\n" +
                "      },\n" +
                "      \"member\": {\n" +
                "        \"can_view\": true,\n" +
                "        \"can_edit\": true,\n" +
                "        \"can_delete\": true,\n" +
                "        \"can_toggle_visibility\": true\n" +
                "      },\n" +
                "      \"other\": {\n" +
                "        \"can_view\": true,\n" +
                "        \"can_edit\": true,\n" +
                "        \"can_delete\": true,\n" +
                "        \"can_toggle_visibility\": true\n" +
                "      }\n" +
                "    }\n" +
                "}";

        rightGroupId = new RightGroupsTests().staticValidRightGroupPostTest();
        validPostTemplate = String.format(postTemplate, rightGroupId);
        validPutTemplate = String.format(putTemplate, 1);
    }

    @Test
    public void templateGetTest() {
        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get("templates")
                .then()
                .statusCode(200);
    }

    @Test
    public void validTemplatePostTest() {
         given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(validPostTemplate)
                .post("templates")
                .then()
                .statusCode(201);
    }

    @Test
    public void invalidTemplatePostTest() {
        given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(INVALID_TEMPLATE)
                .post("templates")
                .then()
                .statusCode(405);
    }

    @Test
    public void validTemplatePutTest() {
    }

    @Test
    public void invalidTemplateIdPutTest() {
        given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body(validPutTemplate)
                .put(String.format("templates/%d", 9999))
                .then()
                .statusCode(500);
    }

    @Test
    public void validTemplateIdDeleteTest() {
        given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .delete(String.format("templates/%d", templateId))
                .then()
                .statusCode(204);
    }
}
