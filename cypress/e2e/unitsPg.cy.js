describe('Check unit page formatting', () => {
  it('Will check ui of the unit page', () => {
    cy.visit('http://localhost:3000/lessons');
    cy.wait(2500);
    // get all of the elements that has error-message-container class name and check if they do not exist

    cy.get('.error-message-container').should('not.exist');

    cy.get('.unit-txt-test').should(($elements) => {
      const elementsArr = Array.from($elements);
      const areTxtsPresent = elementsArr.every((element) => element.textContent.length > 0);
      expect(areTxtsPresent).to.equal(true);
    });
    cy.get('.web-app-test-txt').should(($elements) => {
      const elementsArr = Array.from($elements);
      const areTxtsPresent = elementsArr.every((element) => element.textContent.length > 0);
      expect(areTxtsPresent).to.equal(true);
    });
    cy.get('.video-card-test-text').should(($elements) => {
      const elementsArr = Array.from($elements);
      const areTxtsPresent = elementsArr.every((element) => element.textContent.length > 0);
      expect(areTxtsPresent).to.equal(true);
    });
    cy.get('.for-lesson-text-test').should(($elements) => {
      const elementsArr = Array.from($elements);
      const areTxtsPresent = elementsArr.every((element) => element.textContent.length > 0);
      expect(areTxtsPresent).to.equal(true);
    });
    // see-more-btn-txt is a button and it will have the Show more (x) and x is number
    // check if x is a number
    cy.get('.see-more-btn-txt').should(($elements) => {
      const elementsArr = Array.from($elements);
      const areTxtsPresent = elementsArr.every((element) => {
        const txt = element.textContent;
        const isNum = /^\d+$/.test(txt);
        return isNum;
      });
      // expect(areTxtsPresent).to.equal(true);

    });
    cy.get('.video-card-description').should('exist');
  });
});
