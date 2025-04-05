describe('Check unit page formatting', () => {
    let body;

    before(() => {
        const url = new URL('http://localhost:3000/api/get-lessons');
        const filterObjStr = JSON.stringify({ numID: [5] })
        url.searchParams.set('filterObj', filterObjStr)
        cy.request('GET', url.href).then((response) => {
            body = response.body;
        });
    });

    it('Will check ui of the unit page', () => {
        console.log("The test is running...");

        cy.visit('http://localhost:3000/lessons/5');

        cy.wait(2500);

        cy.get("#unit-target-subject").should(($element) => {
            const targetSubjectTxt = $element.text();

            expect(targetSubjectTxt.length > 0).to.equal(true);
        })

        cy.get("#unit-learning-summary").should(($element) => {
            const unitLearningSummaryTxt = $element.text();

            expect(unitLearningSummaryTxt.length > 0).to.equal(true);
        })
    });
})