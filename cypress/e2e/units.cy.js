describe('Check unit page formatting', () => {
    let body;

    before(() => {
        const url = new URL('http://localhost:3000/api/get-lessons');
        const filterObjStr = JSON.stringify({ numID: [15], locale: ['en-NZ'] })
        url.searchParams.set('filterObj', filterObjStr)
        cy.request('GET', url.href).then((response) => {
            body = response.body;
        });
    });

    it('Will check ui of the unit page', () => {
        console.log("The test is running...");

        const lesson = body.lessons[0];
        const resources = lesson.Section['teaching-materials'].Data.classroom.resources;
        const lsnNumsArrs = resources[0].lessons.map(lesson => lesson.lsn);
        const lessons = lesson.Section['teaching-materials'].Data.lesson;
        const learningObjIds = [];
        const itemTitleClassNames = resources[0].lessons.flatMap(lesson => {
            return lesson.itemList.map((_, index) => `item-title-${lesson.lsn}-${index}`)
        })
        const lessonTileIds = resources[0].lessons.map(lesson => `${lesson.lsn}-tile`)

        console.log("itemTitleClassNames: ", itemTitleClassNames);

        console.log("lesson.Section['teaching-materials'].Data, lessons: ", lessons);

        console.log("lesson.Section['teaching-materials'].Data: ", lesson.Section['teaching-materials'].Data);

        const goingFutherTitleClassNameRoots = lessons.flatMap(lesson => {
            const lsnExt = lesson.lsnExt.map(lsn => {
                return lsn.itemTitle.split(' ').join('-').replace(/[^a-zA-Z]/g, '');
            });

            return lsnExt;
        });
        const goingFutherDescriptionsClassNames = lessons.flatMap(lesson => {
            const lsnExt = lesson.lsnExt.map(lsn => {
                if (lsn.itemDescription) {
                    return `${lsn.itemTitle.split(' ').join('-').replace(/[^a-zA-Z]/g, '')}-description`;
                }

                return null;
            }).filter(Boolean);

            return lsnExt;
        });
        const chunksClassNames = lessons.flatMap(lesson => lesson.chunks.map((_, index) => `chunk-graph-${lesson.lsnNum}-${index}`));
        const chunksStepsIds = lessons.flatMap(lesson => {
            console.log("hey there, lesson.chunks: ", lesson.chunks);
            return lesson.chunks.flatMap((chunk) => chunk.steps.map((step, index) => {
                return `${step.StepTitle.split(' ').join('-')}-${index}`.replace("'", "");
            })
            );
        });
        const chunksStepsTitleClassNames = lessons.flatMap(lesson => {
            console.log("hey there, lesson.chunks: ", lesson.chunks);
            return lesson.chunks.flatMap((chunk) => chunk.steps.map((step, index) => {
                return `${step.StepTitle.split(' ').join('-')}-title`.replace("'", "");
            })
            );
        });
        const chunksStepsDescriptionClassNames = lessons.flatMap(lesson => {
            console.log("hey there, lesson.chunks: ", lesson.chunks);
            return lesson.chunks.flatMap((chunk) => chunk.steps.map((step, index) => {
                return `${step.StepTitle.split(' ').join('-')}-description`.replace("'", "");
            })
            );
        });
        const chunksStepsStepVocab = lessons.flatMap(lesson => {
            console.log("hey there, lesson.chunks: ", lesson.chunks);
            return lesson.chunks.flatMap((chunk) => chunk.steps.map((step, index) => {
                if (step.Vocab) {
                    return `${step.StepTitle.split(' ').join('-')}-step-vocab`.replace("'", "");
                }

                return null;
            }).filter(Boolean)
            );
        })
        // print chunksStepsStepVocab
        console.log("chunksStepsStepVocab, yo there: ", chunksStepsStepVocab);
        const chunksStepsDetailsClassNames = lessons.flatMap(lesson => {
            console.log("hey there, lesson.chunks: ", lesson.chunks);
            return lesson.chunks.flatMap((chunk) => chunk.steps.map((step) => {
                if (step.StepDetails) {
                    return `${step.StepTitle.split(' ').join('-')}-step-details`.replace("'", "");
                }

                return null;
            })
            );
        });
        const chunksStepsTeachingTipsClassNames = lessons.flatMap(lesson => {
            console.log("hey there, lesson.chunks: ", lesson.chunks);

            return lesson.chunks.flatMap((chunk) => chunk.steps.map((step, index) => {
                if (step.TeachingTips) {
                    return `${step.StepTitle.split(' ').join('-')}-teaching-tips`.replace("'", "");
                }
                return null;
            }).filter(Boolean)
            );
        });
        const chunksStepsTeachingVariantNotesClassNames = lessons.flatMap(lesson => {
            console.log("hey there, lesson.chunks: ", lesson.chunks);
            return lesson.chunks.flatMap((chunk) => chunk.steps.map((step, index) => {
                if (step.VariantNotes) {
                    return `${step.StepTitle.split(' ').join('-')}-variant-notes`.replace("'", "");
                }
                return null;
            }).filter(Boolean)
            );
        });



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

        cy.get(`#gradeVariation`).should(($element) => {
            const headingTxt = $element.text();
            const txts = headingTxt.split(" ");

            expect(txts.length).to.equal(3);
        })


        lessonTileIds.forEach(tileId => {
            cy.get(`#${tileId}`)
                .should('exist');
        })

        tagIds.forEach(tagId => {
            cy.get(`#${tagId}`)
                .should('exist');
        })

        learningObjIds.forEach(learningObjId => {
            cy.get(`#${learningObjId}`)
                .should('exist');
        })


        itemTitleClassNames.forEach(itemTitleClassName => {
            cy.get(`.${itemTitleClassName}`)
                .should('exist');
        })

        chunksClassNames.forEach(chunkClassName => {
            cy.get(`.${chunkClassName}`)
                .should('exist');
        });

        console.log('chunkStepIds, sup there: ', chunksStepsIds);

        chunksStepsIds.forEach(chunkStepClassName => {
            cy.get(`#${chunkStepClassName}`)
                .should('exist');
        })

        chunksStepsTitleClassNames.forEach(chunkStepTitleClassName => {
            cy.get(`.${chunkStepTitleClassName}`)
                .should('exist').should('not.be.empty');
        })

        chunksStepsDescriptionClassNames.forEach(chunkStepDescriptionClassName => {
            cy.get(`.${chunkStepDescriptionClassName}`)
                .should('exist').should('not.be.empty');
        })

        chunksStepsStepVocab.forEach(checkStepsStepVocabClassName => {
            cy.get(`.${checkStepsStepVocabClassName}`)
                .should('exist').should('not.be.empty');
        })

        chunksStepsDetailsClassNames.forEach(className => {
            // the text should not be empty
            cy.get(`.${className}`)
                .should('exist').should('not.be.empty');
        })
        chunksStepsTeachingTipsClassNames.forEach(className => {
            cy.get(`.${className}`)
                .should('exist').should('not.be.empty');
        })

        chunksStepsTeachingVariantNotesClassNames.forEach(className => {
            cy.get(`.${className}`)
                .should('exist').should('not.be.empty');
        })

        goingFutherTitleClassNameRoots.forEach(goingFurtherTitleClassNameRoot => {
            cy.get(`.${goingFurtherTitleClassNameRoot}-title`)
                .should('exist').should('not.be.empty');
        })
        goingFutherDescriptionsClassNames.forEach(goingFurtherTitleClassNameRoot => {
            cy.get(`.${goingFurtherTitleClassNameRoot}`)
                .should('exist').should('not.be.empty');
        })
    });
})