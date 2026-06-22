import Editor from '../../../src/editor';

describe('-', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/canvas-editor/');

    cy.get('canvas').first().as('canvas').should('have.length', 1);
  });

  it('', () => {
    cy.getEditor().then((editor: Editor) => {
      editor.command.executeSelectAll();

      editor.command.executeBackspace();

      cy.get('.menu-item__page-break').click().click();

      cy.get('canvas').should('have.length', 2);
    });
  });
});
