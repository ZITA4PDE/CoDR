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

import java.io.File;

import static io.restassured.RestAssured.given;

public class FilesTests extends CoDRTest {

    private File file;
    Integer moduleId;
    Integer courseId;
    Integer exerciseId;
    Integer projectId;
    Integer fileId;

    @Test
    public void validFilePostTest() {
        ClassLoader classLoader = getClass().getClassLoader();
        file = new File(classLoader.getResource("DPAService.txt").getFile());
        ProjectsTests projectsTests = new ProjectsTests();
        projectsTests.validProjectPostTest();
        moduleId = projectsTests.moduleId;
        courseId = projectsTests.courseId;
        exerciseId = projectsTests.exerciseId;
        projectId = projectsTests.projectId;
        given()
                .multiPart(file)
                .post(String.format("modules/%d/courses/%d/exercises/%d/projects/%d/files", moduleId, courseId,
                        exerciseId, projectId))
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void validFileIdGetTest() {
        validFilePostTest();
        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("modules/%d/courses/%d/exercises/%d/projects/%d/files/%d", moduleId, courseId,
                        exerciseId, projectId, 1))
                .then()
                .assertThat()
                .statusCode(200);
    }

    @Test
    public void invalidFileIdGetTest() {
        validFilePostTest();
        given()
                .headers(Util.GET_REQUEST_HEADER)
                .get(String.format("modules/%d/courses/%d/exercises/%d/projects/%d/files/%d", moduleId, courseId,
                        exerciseId, projectId, 123))
                .then()
                .assertThat()
                .statusCode(404);
    }

}
