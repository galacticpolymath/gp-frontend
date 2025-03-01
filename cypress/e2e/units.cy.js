describe('Check unit page formatting', () => {
    it('Will check ui of the unit page', async () => {
        console.log("The test is running...");
        const filterObjStr = JSON.stringify({ numID: [15], locale: ['en-NZ'] })
        const url = new URL('http://localhost:3000/api/get-lessons');

        url.searchParams.set('filterObj', filterObjStr)

        const response = await fetch(url.href);
        const body = await response.json();
        const lesson = body.lessons[0];
        const resources = lesson.Section['teaching-materials'].Data.classroom.resources;
        const lsnNumsArrs = resources[0].lessons.map(lesson => lesson.lsn);
        const lessons = lesson.Section['teaching-materials'].Data.lesson;
        const learningObjIds = [];
        const itemTitleIds = resources[0].lessons.flatMap(lesson => {
            return lesson.itemList.map((_, index) => `item-title-${lesson.lsn}-${index}`)
        })

        console.log("itemTitleIds: ", itemTitleIds);

        console.log("lesson.Section['teaching-materials'].Data: ", lesson.Section['teaching-materials'].Data)

        for (const lsnNumArr of lsnNumsArrs) {
            for (const lsnIndex in lsnNumArr) {
                const lsn = lsnNumArr[lsnIndex];
                const { learningObj } = lessons.find(lesson => lesson.lsnNum == lsn) ?? {};

                if (learningObj) {
                    const learningObjs = learningObj.map((_, index) => `objective-${lsn}-${index}`);

                    learningObjIds.push(...learningObjs);
                }
            }
        }

        const tagIds = resources[0].lessons.flatMap(lesson => {
            console.log('lesson.tags, yo there: ', lesson.tags);

            if (!lesson.tags) {
                return null;
            }

            const lessonTags = lesson.tags.filter(tag => tag).flat().map(tag => `${lesson.lsn}-${tag.split(' ').join('-')}`);

            return lessonTags;
        }).filter(Boolean);

        cy.visit('http://localhost:3000/lessons/en-NZ/15');

        cy.wait(2500);

        const gradeVariation = await cy.get(`#gradeVariation`);
        const headingTxt = gradeVariation.text();
        const txts = headingTxt.split(" ");

        expect(txts.length).to.equal(3);

        cy.get('.lesson-tile')
            .then(tiles => {
                const tilesArr = Array.from(tiles);

                tilesArr.forEach(tile => {
                    const isTileDisplayed = tile.naturalWidth > 0 && tile.naturalHeight > 0;

                    expect(isTileDisplayed).to.equal(true);
                });
            });

        console.log('tagIds: ', tagIds);

        tagIds.forEach(tagId => {
            cy.get(`#${tagId}`)
                .should('exist');
        })

        learningObjIds.forEach(learningObjId => {
            cy.get(`#${learningObjId}`)
                .should('exist');
        })


        itemTitleIds.forEach(itemTitleId => {
            cy.get(`.${itemTitleId}`)
                .should('exist');
        })
    });
})