test("Will check if all of the lesson parts are formatted correctly.", async () => {
    const url = new URL('http://localhost:3000/api/get-lessons');
    const response = await fetch(url.href);
    const { lessons } = await response.json() ?? {};
    const firstUnitLesson = lessons[0].Section['teaching-materials'].Data.classroom.resources[0].lessons[0];
    const firstUnitLessonKeys = new Set(Object.keys(firstUnitLesson));
    let areAllLessonKeysTheSame = true;
    let differentLesson = null;

    for (const lesson of lessons) {
        for (const resource of lesson.Section['teaching-materials'].Data.classroom.resources) {
            for (const lesson of resource.lessons) {
                for (const key of Object.keys(lesson)) {
                    if (!firstUnitLessonKeys.has(key)) {
                        differentLesson = lesson;
                        areAllLessonKeysTheSame = false;
                        break;
                    }
                }
            }
        }
    }

    console.log("first unit keys: ", firstUnitLessonKeys);
    if (differentLesson) {
        console.log("At least one lesson is different: ");
        console.log(differentLesson)
    }

    expect(areAllLessonKeysTheSame).toBe(true);
}); 