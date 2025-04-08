function checkIfElementHasTxt(identifier) {
    cy.get(identifier).should(($elements) => {
        const elementsArr = Array.from($elements);

        if (elementsArr.length) {
            const areTxtsPresent = elementsArr.every(
                (element) => element.textContent.length > 0
            );

            expect(areTxtsPresent).to.equal(true);
        }
    });
}

function checkIfElementHasChildren(identifier) {
    cy.get(identifier).should(($elements) => {
        $elements.each((index, element) => {
            const hasChildren = Cypress.$(element).children().length > 0; // Check child count
            console.log(`Element at index ${index} has children: ${hasChildren}`);
            expect(hasChildren).to.be.true; // Assert that the element has children
        });
    });
}

// create a function that will check if a element is visible
function checkIfElementIsVisible(identifier) {
    cy.get(identifier).should("be.visible");
}

function checkIfElementsExist(identifier) {
    cy.get(identifier).should(($elements) => {
        expect($elements.length).to.be.greaterThan(0);
    });
}

function checkIfIFrameLoaded(identifier) {
    cy.get(identifier).should($element => {
        console.log("the iframe, element: ", $element);
    });
}

describe("Check unit page formatting", () => {
    it("Will check ui of the unit page", () => {
        console.log("The test is running...");

        cy.visit("http://localhost:3000/lessons/5");

        cy.wait(2500);

        cy.get("#unit-target-subject").should(($element) => {
            const targetSubjectTxt = $element.text();

            expect(targetSubjectTxt.length > 0).to.equal(true);
        });

        cy.get("#overview_sec").should("exist");
        cy.get("#overview_sec").should("be.visible");

        cy.get(".lesson-preface-testing").should(($elements) => {
            const lessonPrefaceElements = Array.from($elements);
            const areTxtsPresent = lessonPrefaceElements.every(
                (element) => element.textContent.length > 0
            );

            expect(areTxtsPresent).to.equal(true);
        });

        cy.get(".tag-testing").should(($elements) => {
            const tagElement = Array.from($elements);
            const areTagTxtPresent = tagElement.every(
                (element) => element.textContent.length > 0
            );

            expect(areTagTxtPresent).to.equal(true);
        });


        checkIfElementHasTxt(".lesson-learning-obj");

        checkIfElementHasTxt(".lessons-preface-testing");

        cy.get(".grade-variation-testing").should(($elements) => {
            $elements.each((index, element) => {
                const hasValue = Cypress.$(element).val().length > 0;
                expect(hasValue).to.equal(true);
            });
        })

        checkIfElementHasTxt(".lesson-item-title");

        checkIfElementHasTxt("#unit-learning-summary");

        checkIfElementHasTxt(".lesson-item-description");

        checkIfElementHasTxt(".step-num-testing");

        checkIfElementHasTxt(".lesson-step-title");

        checkIfElementHasTxt(".lesson-step-description");

        checkIfElementHasTxt(".lesson-step-details");

        checkIfElementHasTxt(".lesson-step-vocab");

        checkIfElementHasTxt(".lesson-step-variant-notes");

        checkIfElementHasTxt(".lesson-step-teaching-tips-testing");

        checkIfElementHasTxt(".subject-header-testing");

        checkIfElementHasTxt(".subject-name");

        checkIfElementHasTxt(".statement-txt-testing");

        checkIfElementHasTxt(".alignment-notes-testing");

        checkIfElementHasTxt(".ack-role-testing");

        checkIfElementHasTxt(".ack-affiliation-testing");

        checkIfElementHasTxt("#est-time-testing");

        checkIfElementIsVisible("#teach-it-sec")

        checkIfElementIsVisible("#unit-banner-id")

        checkIfElementIsVisible(".versions-btn-testing")

        checkIfElementIsVisible(".teaching-environment-testing")

        checkIfElementIsVisible(".sponsor-img")

        checkIfElementHasChildren(".section-testing")

        checkIfIFrameLoaded(".media-testing")

        // checkIfElementIsVisible(".media-img-testing")

        cy.get("#materials-title").should(($element) => {
            const headingTxt = $element.text();
            const txts = headingTxt.split(" ");

            expect(txts.length).to.equal(4);
        });

        checkIfElementsExist(".lesson-file-img-testing")

        cy.get(".chunk-graph-testing").should(($elements) => {
            $elements.each((index, element) => {
                const hasChildren = Cypress.$(element).children().length > 0; // Check child count
                console.log(`Element at index ${index} has children: ${hasChildren}`);
                expect(hasChildren).to.be.true; // Assert that the element has children
            });
        });

        cy.get("#unit-preview-id").should(($element) => {
            const text = $element.text();
            // print the text 
            console.log("text: ", text);
        });

        // it must be visible and must have children
        cy.get("#unit-preview-container").should(($element) => {
            const hasChildren = Cypress.$($element).children().length > 0;
            console.log(`Element has children: ${hasChildren}`);
            expect(hasChildren).to.be.true;
            expect($element.is(":visible")).to.be.true;
        })
    });
});
