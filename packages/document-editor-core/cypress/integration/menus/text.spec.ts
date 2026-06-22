import Editor from '../../../src/editor';

describe('-', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/canvas-editor/');

    cy.get('canvas').first().as('canvas').should('have.length', 1);
  });

  const text = 'canvas-editor';
  const textLength = text.length;

  it('', () => {
    cy.getEditor().then((editor: Editor) => {
      editor.command.executeSelectAll();

      editor.command.executeBackspace();

      editor.command.executeInsertElementList([
        {
          value: text,
        },
      ]);

      editor.command.executeSetRange(0, textLength);

      cy.get('.menu-item__font').as('font').click();

      cy.get('@font')
        .find('li')
        .eq(1)
        .click()
        .then(() => {
          const data = editor.command.getValue().data.main;

          expect(data[0].font).to.eq('');
        });
    });
  });

  it('', () => {
    cy.getEditor().then((editor: Editor) => {
      editor.command.executeSelectAll();

      editor.command.executeBackspace();

      editor.command.executeInsertElementList([
        {
          value: text,
        },
      ]);

      editor.command.executeSetRange(0, textLength);

      cy.get('.menu-item__size').as('size').click();

      cy.get('@size')
        .find('li')
        .eq(0)
        .click()
        .then(() => {
          const data = editor.command.getValue().data.main;

          expect(data[0].size).to.eq(56);
        });
    });
  });

  it('', () => {
    cy.getEditor().then((editor: Editor) => {
      editor.command.executeSelectAll();

      editor.command.executeBackspace();

      editor.command.executeInsertElementList([
        {
          value: text,
        },
      ]);

      editor.command.executeSetRange(0, textLength);

      cy.get('.menu-item__size-add')
        .click()
        .then(() => {
          const data = editor.command.getValue().data.main;

          expect(data[0].size).to.eq(18);
        });
    });
  });

  it('', () => {
    cy.getEditor().then((editor: Editor) => {
      editor.command.executeSelectAll();

      editor.command.executeBackspace();

      editor.command.executeInsertElementList([
        {
          value: text,
        },
      ]);

      editor.command.executeSetRange(0, textLength);

      cy.get('.menu-item__size-minus')
        .click()
        .then(() => {
          const data = editor.command.getValue().data.main;

          expect(data[0].size).to.eq(14);
        });
    });
  });

  it('', () => {
    cy.getEditor().then((editor: Editor) => {
      editor.command.executeSelectAll();

      editor.command.executeBackspace();

      editor.command.executeInsertElementList([
        {
          value: text,
        },
      ]);

      editor.command.executeSetRange(0, textLength);

      cy.get('.menu-item__bold')
        .click()
        .then(() => {
          const data = editor.command.getValue().data.main;

          expect(data[0].bold).to.eq(true);
        });
    });
  });

  it('', () => {
    cy.getEditor().then((editor: Editor) => {
      editor.command.executeSelectAll();

      editor.command.executeBackspace();

      editor.command.executeInsertElementList([
        {
          value: text,
        },
      ]);

      editor.command.executeSetRange(0, textLength);

      cy.get('.menu-item__italic')
        .click()
        .then(() => {
          const data = editor.command.getValue().data.main;

          expect(data[0].italic).to.eq(true);
        });
    });
  });

  it('', () => {
    cy.getEditor().then((editor: Editor) => {
      editor.command.executeSelectAll();

      editor.command.executeBackspace();

      editor.command.executeInsertElementList([
        {
          value: text,
        },
      ]);

      editor.command.executeSetRange(0, textLength);

      cy.get('.menu-item__underline')
        .click()
        .then(() => {
          const data = editor.command.getValue().data.main;

          expect(data[0].underline).to.eq(true);
        });
    });
  });

  it('', () => {
    cy.getEditor().then((editor: Editor) => {
      editor.command.executeSelectAll();

      editor.command.executeBackspace();

      editor.command.executeInsertElementList([
        {
          value: text,
        },
      ]);

      editor.command.executeSetRange(0, textLength);

      cy.get('.menu-item__strikeout')
        .click()
        .then(() => {
          const data = editor.command.getValue().data.main;

          expect(data[0].strikeout).to.eq(true);
        });
    });
  });

  it('', () => {
    cy.getEditor().then((editor: Editor) => {
      editor.command.executeSelectAll();

      editor.command.executeBackspace();

      editor.command.executeInsertElementList([
        {
          value: text,
        },
      ]);

      editor.command.executeSetRange(0, textLength);

      cy.get('.menu-item__superscript')
        .click()
        .then(() => {
          const data = editor.command.getValue().data.main;

          expect(data[0].type).to.eq('superscript');
        });
    });
  });

  it('', () => {
    cy.getEditor().then((editor: Editor) => {
      editor.command.executeSelectAll();

      editor.command.executeBackspace();

      editor.command.executeInsertElementList([
        {
          value: text,
        },
      ]);

      editor.command.executeSetRange(0, textLength);

      cy.get('.menu-item__subscript')
        .click()
        .then(() => {
          const data = editor.command.getValue().data.main;

          expect(data[0].type).to.eq('subscript');
        });
    });
  });

  it('', () => {
    cy.getEditor().then((editor: Editor) => {
      editor.command.executeSelectAll();

      editor.command.executeBackspace();

      editor.command.executeInsertElementList([
        {
          value: text,
        },
      ]);

      editor.command.executeSetRange(0, textLength);

      editor.command.executeColor('red');

      const data = editor.command.getValue().data.main;

      expect(data[0].color).to.eq('red');
    });
  });

  it('', () => {
    cy.getEditor().then((editor: Editor) => {
      editor.command.executeSelectAll();

      editor.command.executeBackspace();

      editor.command.executeInsertElementList([
        {
          value: text,
        },
      ]);

      editor.command.executeSetRange(0, textLength);

      editor.command.executeHighlight('red');

      const data = editor.command.getValue().data.main;

      expect(data[0].highlight).to.eq('red');
    });
  });
});
