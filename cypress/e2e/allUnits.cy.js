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

function checkIfElementsExist(identifier) {
    cy.get(identifier).should(($elements) => {
        expect($elements.length).to.be.greaterThan(0);
    });
}

describe("Check unit page formatting", () => {
    let body;

    before(() => {
        const url = new URL("http://localhost:3000/api/get-lessons");
        const filterObjStr = JSON.stringify({ numID: [5] });
        url.searchParams.set("filterObj", filterObjStr);
        cy.request("GET", url.href).then((response) => {
            body = response.body;
        });
    });

    it("Will check ui of the unit page", () => {
        console.log("The test is running...");

        cy.visit("http://localhost:3000/lessons/5");

        cy.wait(2500);

        cy.get("#unit-target-subject").should(($element) => {
            const targetSubjectTxt = $element.text();

            expect(targetSubjectTxt.length > 0).to.equal(true);
        });

        cy.get("#overview_sec").should("exist");

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
        checkIfElementHasTxt(".lesson-item-title");
        checkIfElementHasTxt("#unit-learning-summary");
        checkIfElementHasTxt(".lesson-item-description");

        cy.get("#materials-title").should(($element) => {
            const headingTxt = $element.text();
            const txts = headingTxt.split(" ");

            expect(txts.length).to.equal(4);
        });

        checkIfElementsExist(".lesson-file-img-testing")
    });
});
