describe('Check unit page formatting', () => {
    it('Will check ui of the unit page', async () => {
        console.log("The test is running...");
        cy.visit('http://localhost:3000/lessons/en-NZ/15');
        cy.wait(2500);
        const gradeVariation = await cy.get(`#gradeVariation`);
        const headingTxt = gradeVariation.text();
        const txts = headingTxt.split(" ");

        expect(txts.length).to.equal(3)
    });
})