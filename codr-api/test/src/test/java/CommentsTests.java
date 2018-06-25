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

import org.junit.Before;
import org.junit.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;

public class CommentsTests extends CoDRTest {


    private Integer moduleId;
    private Integer courseId;
    private Integer exerciseId;
    private Integer projectId;
    private Integer fileId;
    private Integer commentId;

    @Test
    public void validCommentPostTest() {
        FilesTests filesTests = new FilesTests();
        filesTests.validFilePostTest();
        moduleId = filesTests.moduleId;
        courseId = filesTests.courseId;
        exerciseId = filesTests.exerciseId;
        projectId = filesTests.projectId;
        fileId = 1;

        String comment = "{\n" +
                "    \"line_range\":\"1-5\",\n" +
                "    \"content\":\"zeker\"\n" +
                "}";

        given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(comment)
                .post(String.format("modules/%d/courses/%d/exercises/%d/projects/%d/files/%d/comments", moduleId,
                        courseId, exerciseId, projectId, fileId))
                .then()
                .assertThat()
                .statusCode(201);
    }

    @Test
    public void invalidCommentPostTest() {
        String comment = "{\n" +
                "    \"line_rangee\":\"1-5\",\n" +
                "    \"content\":\"zeker\"\n" +
                "}";

        given()
                .headers(Util.POST_REQUEST_HEADER)
                .body(comment)
                .post(String.format("modules/%d/courses/%d/exercises/%d/projects/%d/files/%d/comments", moduleId,
                        courseId, exerciseId, projectId, fileId))
                .then()
                .assertThat()
                .statusCode(400);
    }

    @Test
    public void validCommentIdDeleteTest() {
        validCommentPostTest();
        commentId = 1;
           given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .delete(String.format("modules/%d/courses/%d/exercises/%d/projects/%d/files/%d/comments/%d", moduleId,
                        courseId, exerciseId, projectId, fileId, commentId))
                .then()
                .assertThat()
                .statusCode(204);
    }

    @Test
    public void invalidCommentIdDeleteTest() {
        commentId = 9999;
        given()
                .headers(Util.DELETE_REQUEST_HEADER)
                .delete(String.format("modules/%d/courses/%d/exercises/%d/projects/%d/files/%d/comments/%d", moduleId,
                        courseId, exerciseId, projectId, fileId, commentId))
                .then()
                .assertThat()
                .statusCode(400);
    }

    @Test
    public void validCommentIdPutTest() {
        validCommentPostTest();
        commentId = 2;
        String comment = "{\n" +
                "  \"content\": \"new put content\"\n" +
                "}";

        given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body(comment)
                .put(String.format("modules/%d/courses/%d/exercises/%d/projects/%d/files/%d/comments/%d", moduleId,
                        courseId, exerciseId, projectId, fileId, commentId))
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void invalidCommentIdPutTest() {
        commentId = 9999;
        String comment = "{\n" +
                "  \"content\": \"new put content\"\n" +
                "}";

        given()
                .headers(Util.PUT_REQUEST_HEADER)
                .body(comment)
                .put(String.format("modules/%d/courses/%d/exercises/%d/projects/%d/files/%d/comments/%d", moduleId,
                        courseId, exerciseId, projectId, fileId, commentId))
                .then()
                .assertThat()
                .statusCode(400);
    }
}
