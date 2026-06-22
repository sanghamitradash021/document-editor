import { data, options } from './mock';
import './style.css';
// syntax highlishting
import prism from 'prismjs';
import Editor, {
  BlockType,
  Command,
  ControlType,
  EditorMode,
  ElementType,
  IBlock,
  ICatalogItem,
  IElement,
  KeyMap,
  ListStyle,
  ListType,
  PageMode,
  PaperDirection,
  RowFlex,
  TitleLevel,
} from './editor';
import { Dialog } from './components/dialog/Dialog';
import { formatPrismToken } from './utils/prism';
import { Signature } from './components/signature/Signature';
import { debounce } from './utils';

window.onload = function () {
  const isApple =
    typeof navigator !== 'undefined' && /Mac OS X/.test(navigator.userAgent);

  const container = document.querySelector<HTMLDivElement>('.editor')!;
  const instance = new Editor(
    container,
    {
      header: [
        {
          value: `First People's Hospital`,
          size: 32,
          rowFlex: RowFlex.CENTER,
        },
        {
          value: '\nPatient medical records',
          size: 18,
          rowFlex: RowFlex.CENTER,
        },
        {
          value: '\n',
          type: ElementType.SEPARATOR,
        },
      ],
      main: <IElement[]>data,
    },
    options
  );
  console.log('example: ', instance);
  // cypress uses
  Reflect.set(window, 'editor', instance);

  /**
   * Close the menu option when a submenu is clicked.
   */
  window.addEventListener(
    'click',
    evt => {
      const visibleDom = document.querySelector('.visible');
      if (!visibleDom || visibleDom.contains(<Node>evt.target)) return;
      visibleDom.classList.remove('visible');
    },
    {
      capture: true,
    }
  );

  // Keep editor selection/caret when clicking toolbar buttons.
  // Buttons would otherwise steal focus on mousedown and collapse the selection.
  const menuDom = document.querySelector<HTMLDivElement>('.menu');
  menuDom?.addEventListener('mousedown', evt => {
    const target = evt.target as HTMLElement;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    evt.preventDefault();
  });

  //TOOLBAR OPERATIONS

  // 2.| Undo | Redo | Format Painter | Clear Formatting |
  const undoDom = document.querySelector<HTMLDivElement>('.menu-item__undo')!;
  undoDom.title = `Undo (${isApple ? '⌘' : 'Ctrl'}+Z)`;
  undoDom.onclick = function () {
    console.log('undo');
    instance.command.executeUndo();
  };

  const redoDom = document.querySelector<HTMLDivElement>('.menu-item__redo')!;
  redoDom.title = `(${isApple ? '⌘' : 'Ctrl'}+Y)`;
  redoDom.onclick = function () {
    console.log('redo');
    instance.command.executeRedo();
  };

  // Usecase ??
  const painterDom = document.querySelector<HTMLDivElement>(
    '.menu-item__painter'
  )!;
  painterDom.onclick = function () {
    console.log('painter');
    instance.command.executePainter({
      isDblclick: false,
    });
  };
  painterDom.ondblclick = function () {
    console.log('painter');
    instance.command.executePainter({
      isDblclick: true,
    });
  };

  document.querySelector<HTMLDivElement>('.menu-item__format')!.onclick =
    function () {
      console.log('Clear formatting');
      instance.command.executeFormat();
    };

  // 3. | Font | Bigger Font | Smaller Font | Bold | Italic | Underline | Strikethrough | Superscript | Subscript | Font Color | Background Color |
  const fontDom = document.querySelector<HTMLDivElement>('.menu-item__font')!;
  const fontSelectDom = fontDom.querySelector<HTMLDivElement>('.select')!;
  const fontOptionDom = fontDom.querySelector<HTMLDivElement>('.options')!;
  fontDom.onclick = function () {
    console.log('font');
    fontOptionDom.classList.toggle('visible');
  };
  fontOptionDom.onclick = function (evt) {
    const li = evt.target as HTMLLIElement;
    instance.command.executeFont(li.dataset.family!);
  };

  const sizeSetDom =
    document.querySelector<HTMLDivElement>('.menu-item__size')!;
  const sizeSelectDom = sizeSetDom.querySelector<HTMLDivElement>('.select')!;
  const sizeOptionDom = sizeSetDom.querySelector<HTMLDivElement>('.options')!;
  sizeSetDom.title = ``;
  sizeSetDom.onclick = function () {
    console.log('size');
    sizeOptionDom.classList.toggle('visible');
  };
  sizeOptionDom.onclick = function (evt) {
    const li = evt.target as HTMLLIElement;
    instance.command.executeSize(Number(li.dataset.size!));
  };

  const sizeAddDom = document.querySelector<HTMLDivElement>(
    '.menu-item__size-add'
  )!;
  sizeAddDom.title = `(${isApple ? '⌘' : 'Ctrl'}+[)`;
  sizeAddDom.onclick = function () {
    console.log('size-add');
    instance.command.executeSizeAdd();
  };

  const sizeMinusDom = document.querySelector<HTMLDivElement>(
    '.menu-item__size-minus'
  )!;
  sizeMinusDom.title = `(${isApple ? '⌘' : 'Ctrl'}+])`;
  sizeMinusDom.onclick = function () {
    console.log('size-minus');
    instance.command.executeSizeMinus();
  };

  const boldDom = document.querySelector<HTMLDivElement>('.menu-item__bold')!;
  boldDom.title = `(${isApple ? '⌘' : 'Ctrl'}+B)`;
  boldDom.onclick = function () {
    console.log('bold');
    instance.command.executeBold();
  };

  const italicDom =
    document.querySelector<HTMLDivElement>('.menu-item__italic')!;
  italicDom.title = `(${isApple ? '⌘' : 'Ctrl'}+I)`;
  italicDom.onclick = function () {
    console.log('italic');
    instance.command.executeItalic();
  };

  const underlineDom = document.querySelector<HTMLDivElement>(
    '.menu-item__underline'
  )!;
  underlineDom.title = `(${isApple ? '⌘' : 'Ctrl'}+U)`;
  underlineDom.onclick = function () {
    console.log('underline');
    instance.command.executeUnderline();
  };

  const strikeoutDom = document.querySelector<HTMLDivElement>(
    '.menu-item__strikeout'
  )!;
  strikeoutDom.onclick = function () {
    console.log('strikeout');
    instance.command.executeStrikeout();
  };

  const superscriptDom = document.querySelector<HTMLDivElement>(
    '.menu-item__superscript'
  )!;
  superscriptDom.title = `(${isApple ? '⌘' : 'Ctrl'}+Shift+,)`;
  superscriptDom.onclick = function () {
    console.log('superscript');
    instance.command.executeSuperscript();
  };

  const subscriptDom = document.querySelector<HTMLDivElement>(
    '.menu-item__subscript'
  )!;
  subscriptDom.title = `(${isApple ? '⌘' : 'Ctrl'}+Shift+.)`;
  subscriptDom.onclick = function () {
    console.log('subscript');
    instance.command.executeSubscript();
  };

  const colorControlDom = document.querySelector<HTMLInputElement>('#color')!;
  colorControlDom.oninput = function () {
    instance.command.executeColor(colorControlDom.value);
  };
  const colorDom = document.querySelector<HTMLDivElement>('.menu-item__color')!;
  const colorSpanDom = colorDom.querySelector('span')!;
  colorDom.onclick = function () {
    console.log('color');
    colorControlDom.click();
  };

  const highlightControlDom =
    document.querySelector<HTMLInputElement>('#highlight')!;
  highlightControlDom.oninput = function () {
    instance.command.executeHighlight(highlightControlDom.value);
  };
  const highlightDom = document.querySelector<HTMLDivElement>(
    '.menu-item__highlight'
  )!;
  const highlightSpanDom = highlightDom.querySelector('span')!;
  highlightDom.onclick = function () {
    console.log('highlight');
    highlightControlDom?.click();
  };

  const titleDom = document.querySelector<HTMLDivElement>('.menu-item__title')!;
  const titleSelectDom = titleDom.querySelector<HTMLDivElement>('.select')!;
  const titleOptionDom = titleDom.querySelector<HTMLDivElement>('.options')!;
  titleOptionDom.querySelectorAll('li').forEach((li, index) => {
    li.title = `Ctrl+${isApple ? 'Option' : 'Alt'}+${index}`;
  });

  titleDom.onclick = function () {
    console.log('title');
    titleOptionDom.classList.toggle('visible');
  };
  titleOptionDom.onclick = function (evt) {
    const li = evt.target as HTMLLIElement;
    const level = <TitleLevel>li.dataset.level;
    instance.command.executeTitle(level || null);
  };

  const leftDom = document.querySelector<HTMLDivElement>('.menu-item__left')!;
  leftDom.title = `(${isApple ? '⌘' : 'Ctrl'}+L)`;
  leftDom.onclick = function () {
    console.log('left');
    instance.command.executeRowFlex(RowFlex.LEFT);
  };

  const centerDom =
    document.querySelector<HTMLDivElement>('.menu-item__center')!;
  centerDom.title = `(${isApple ? '⌘' : 'Ctrl'}+E)`;
  centerDom.onclick = function () {
    console.log('center');
    instance.command.executeRowFlex(RowFlex.CENTER);
  };

  const rightDom = document.querySelector<HTMLDivElement>('.menu-item__right')!;
  rightDom.title = `(${isApple ? '⌘' : 'Ctrl'}+R)`;
  rightDom.onclick = function () {
    console.log('right');
    instance.command.executeRowFlex(RowFlex.RIGHT);
  };

  const alignmentDom = document.querySelector<HTMLDivElement>(
    '.menu-item__alignment'
  )!;
  alignmentDom.title = `(${isApple ? '⌘' : 'Ctrl'}+J)`;
  alignmentDom.onclick = function () {
    console.log('alignment');
    instance.command.executeRowFlex(RowFlex.ALIGNMENT);
  };

  const rowMarginDom = document.querySelector<HTMLDivElement>(
    '.menu-item__row-margin'
  )!;
  const rowOptionDom = rowMarginDom.querySelector<HTMLDivElement>('.options')!;
  rowMarginDom.onclick = function () {
    console.log('row-margin');
    rowOptionDom.classList.toggle('visible');
  };
  rowOptionDom.onclick = function (evt) {
    const li = evt.target as HTMLLIElement;
    instance.command.executeRowMargin(Number(li.dataset.rowmargin!));
  };

  const listDom = document.querySelector<HTMLDivElement>('.menu-item__list')!;
  listDom.title = `(${isApple ? '⌘' : 'Ctrl'}+Shift+U)`;
  const listOptionDom = listDom.querySelector<HTMLDivElement>('.options')!;
  listDom.onclick = function () {
    console.log('list');
    listOptionDom.classList.toggle('visible');
  };
  listOptionDom.onclick = function (evt) {
    const li = evt.target as HTMLLIElement;
    const listType = <ListType>li.dataset.listType || null;
    const listStyle = <ListStyle>(<unknown>li.dataset.listStyle);
    instance.command.executeList(listType, listStyle);
  };

  // 4. | Table | Image | Hyperlink | Divider | Watermark | Code Block | Separator | Control | Checkbox | LaTeX | Date Picker
  const tableDom = document.querySelector<HTMLDivElement>('.menu-item__table')!;
  const tablePanelContainer = document.querySelector<HTMLDivElement>(
    '.menu-item__table__collapse'
  )!;
  const tableClose = document.querySelector<HTMLDivElement>('.table-close')!;
  const tableTitle = document.querySelector<HTMLDivElement>('.table-select')!;
  const tablePanel = document.querySelector<HTMLDivElement>('.table-panel')!;
  // draw ranks
  const tableCellList: HTMLDivElement[][] = [];
  for (let i = 0; i < 10; i++) {
    const tr = document.createElement('tr');
    tr.classList.add('table-row');
    const trCellList: HTMLDivElement[] = [];
    for (let j = 0; j < 10; j++) {
      const td = document.createElement('td');
      td.classList.add('table-cel');
      tr.append(td);
      trCellList.push(td);
    }
    tablePanel.append(tr);
    tableCellList.push(trCellList);
  }
  let colIndex = 0;
  let rowIndex = 0;
  // remove possessive selection
  function removeAllTableCellSelect() {
    tableCellList.forEach(tr => {
      tr.forEach(td => td.classList.remove('active'));
    });
  }
  // Set title content
  function setTableTitle(payload: string) {
    tableTitle.innerText = payload;
  }
  function recoveryTable() {
    removeAllTableCellSelect();
    setTableTitle('');
    colIndex = 0;
    rowIndex = 0;
    // panel
    tablePanelContainer.style.display = 'none';
  }
  tableDom.onclick = function () {
    console.log('table');
    tablePanelContainer!.style.display = 'block';
  };
  tablePanel.onmousemove = function (evt) {
    const celSize = 16;
    const rowMarginTop = 10;
    const celMarginRight = 6;
    const { offsetX, offsetY } = evt;
    removeAllTableCellSelect();
    colIndex = Math.ceil(offsetX / (celSize + celMarginRight)) || 1;
    rowIndex = Math.ceil(offsetY / (celSize + rowMarginTop)) || 1;
    tableCellList.forEach((tr, trIndex) => {
      tr.forEach((td, tdIndex) => {
        if (tdIndex < colIndex && trIndex < rowIndex) {
          td.classList.add('active');
        }
      });
    });
    setTableTitle(`${rowIndex}×${colIndex}`);
  };
  tableClose.onclick = function () {
    recoveryTable();
  };
  tablePanel.onclick = function () {
    instance.command.executeInsertTable(rowIndex, colIndex);
    recoveryTable();
  };

  const imageDom = document.querySelector<HTMLDivElement>('.menu-item__image')!;
  const imageFileDom = document.querySelector<HTMLInputElement>('#image')!;
  imageDom.onclick = function () {
    imageFileDom.click();
  };
  imageFileDom.onchange = function () {
    const file = imageFileDom.files![0]!;
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = function () {
      const image = new Image();
      const value = fileReader.result as string;
      image.src = value;
      image.onload = function () {
        instance.command.executeImage({
          value,
          width: image.width,
          height: image.height,
        });
        imageFileDom.value = '';
      };
    };
  };

  const hyperlinkDom = document.querySelector<HTMLDivElement>(
    '.menu-item__hyperlink'
  )!;
  hyperlinkDom.onclick = function () {
    console.log('hyperlink');
    new Dialog({
      title: '',
      data: [
        {
          type: 'text',
          label: '',
          name: 'name',
          required: true,
          placeholder: '',
        },
        {
          type: 'text',
          label: '',
          name: 'url',
          required: true,
          placeholder: '',
        },
      ],
      onConfirm: payload => {
        const name = payload.find(p => p.name === 'name')?.value;
        if (!name) return;
        const url = payload.find(p => p.name === 'url')?.value;
        if (!url) return;
        instance.command.executeHyperlink({
          type: ElementType.HYPERLINK,
          value: '',
          url,
          valueList: name.split('').map(n => ({
            value: n,
            size: 16,
          })),
        });
      },
    });
  };

  const separatorDom = document.querySelector<HTMLDivElement>(
    '.menu-item__separator'
  )!;
  const separatorOptionDom =
    separatorDom.querySelector<HTMLDivElement>('.options')!;
  separatorDom.onclick = function () {
    console.log('separator');
    separatorOptionDom.classList.toggle('visible');
  };
  separatorOptionDom.onmousedown = function (evt) {
    let payload: number[] = [];
    const li = evt.target as HTMLLIElement;
    const separatorDash = li.dataset.separator?.split(',').map(Number);
    if (separatorDash) {
      const isSingleLine = separatorDash.every(d => d === 0);
      if (!isSingleLine) {
        payload = separatorDash;
      }
    }
    instance.command.executeSeparator(payload);
  };

  const pageBreakDom = document.querySelector<HTMLDivElement>(
    '.menu-item__page-break'
  )!;
  pageBreakDom.onclick = function () {
    console.log('pageBreak');
    instance.command.executePageBreak();
  };

  const watermarkDom = document.querySelector<HTMLDivElement>(
    '.menu-item__watermark'
  )!;
  const watermarkOptionDom =
    watermarkDom.querySelector<HTMLDivElement>('.options')!;
  watermarkDom.onclick = function () {
    console.log('watermark');
    watermarkOptionDom.classList.toggle('visible');
  };
  watermarkOptionDom.onmousedown = function (evt) {
    const li = evt.target as HTMLLIElement;
    const menu = li.dataset.menu!;
    watermarkOptionDom.classList.toggle('visible');
    if (menu === 'add') {
      new Dialog({
        title: '',
        data: [
          {
            type: 'text',
            label: '',
            name: 'data',
            required: true,
            placeholder: '',
          },
          {
            type: 'color',
            label: '',
            name: 'color',
            required: true,
            value: '#AEB5C0',
          },
          {
            type: 'number',
            label: '',
            name: 'size',
            required: true,
            value: '120',
          },
        ],
        onConfirm: payload => {
          const nullableIndex = payload.findIndex(p => !p.value);
          if (~nullableIndex) return;
          const watermark = payload.reduce(
            (pre, cur) => {
              pre[cur.name] = cur.value;
              return pre;
            },
            <any>{}
          );
          instance.command.executeAddWatermark({
            data: watermark.data,
            color: watermark.color,
            size: Number(watermark.size),
          });
        },
      });
    } else {
      instance.command.executeDeleteWatermark();
    }
  };

  const codeblockDom = document.querySelector<HTMLDivElement>(
    '.menu-item__codeblock'
  )!;
  codeblockDom.onclick = function () {
    console.log('codeblock');
    new Dialog({
      title: '',
      data: [
        {
          type: 'textarea',
          name: 'codeblock',
          placeholder: '',
          width: 500,
          height: 300,
        },
      ],
      onConfirm: payload => {
        const codeblock = payload.find(p => p.name === 'codeblock')?.value;
        if (!codeblock) return;
        const tokenList = prism.tokenize(codeblock, prism.languages.javascript);
        const formatTokenList = formatPrismToken(tokenList);
        const elementList: IElement[] = [];
        for (let i = 0; i < formatTokenList.length; i++) {
          const formatToken = formatTokenList[i];
          const tokenStringList = formatToken.content.split('');
          for (let j = 0; j < tokenStringList.length; j++) {
            const value = tokenStringList[j];
            const element: IElement = {
              value,
            };
            if (formatToken.color) {
              element.color = formatToken.color;
            }
            if (formatToken.bold) {
              element.bold = true;
            }
            if (formatToken.italic) {
              element.italic = true;
            }
            elementList.push(element);
          }
        }
        elementList.unshift({
          value: '\n',
        });
        instance.command.executeInsertElementList(elementList);
      },
    });
  };

  const controlDom = document.querySelector<HTMLDivElement>(
    '.menu-item__control'
  )!;
  const controlOptionDom =
    controlDom.querySelector<HTMLDivElement>('.options')!;
  controlDom.onclick = function () {
    console.log('control');
    controlOptionDom.classList.toggle('visible');
  };
  controlOptionDom.onmousedown = function (evt) {
    controlOptionDom.classList.toggle('visible');
    const li = evt.target as HTMLLIElement;
    const type = <ControlType>li.dataset.control;
    switch (type) {
      case ControlType.TEXT:
        new Dialog({
          title: '',
          data: [
            {
              type: 'text',
              label: '',
              name: 'placeholder',
              required: true,
              placeholder: '',
            },
            {
              type: 'text',
              label: '',
              name: 'value',
              placeholder: '',
            },
          ],
          onConfirm: payload => {
            const placeholder = payload.find(
              p => p.name === 'placeholder'
            )?.value;
            if (!placeholder) return;
            const value = payload.find(p => p.name === 'value')?.value || '';
            instance.command.executeInsertElementList([
              {
                type: ElementType.CONTROL,
                value: '',
                control: {
                  type,
                  value: value
                    ? [
                        {
                          value,
                        },
                      ]
                    : null,
                  placeholder,
                },
              },
            ]);
          },
        });
        break;
      case ControlType.SELECT:
        new Dialog({
          title: '',
          data: [
            {
              type: 'text',
              label: '',
              name: 'placeholder',
              required: true,
              placeholder: '',
            },
            {
              type: 'text',
              label: '',
              name: 'code',
              placeholder: '',
            },
            {
              type: 'textarea',
              label: '',
              name: 'valueSets',
              required: true,
              height: 100,
              placeholder: `JSON，：\n[{\n"value":"",\n"code":"98175"\n}]`,
            },
          ],
          onConfirm: payload => {
            const placeholder = payload.find(
              p => p.name === 'placeholder'
            )?.value;
            if (!placeholder) return;
            const valueSets = payload.find(p => p.name === 'valueSets')?.value;
            if (!valueSets) return;
            const code = payload.find(p => p.name === 'code')?.value;
            instance.command.executeInsertElementList([
              {
                type: ElementType.CONTROL,
                value: '',
                control: {
                  type,
                  code,
                  value: null,
                  placeholder,
                  valueSets: JSON.parse(valueSets),
                },
              },
            ]);
          },
        });
        break;
      case ControlType.CHECKBOX:
        new Dialog({
          title: '',
          data: [
            {
              type: 'text',
              label: '',
              name: 'code',
              placeholder: '，',
            },
            {
              type: 'textarea',
              label: '',
              name: 'valueSets',
              required: true,
              height: 100,
              placeholder: `JSON，：\n[{\n"value":"",\n"code":"98175"\n}]`,
            },
          ],
          onConfirm: payload => {
            const valueSets = payload.find(p => p.name === 'valueSets')?.value;
            if (!valueSets) return;
            const code = payload.find(p => p.name === 'code')?.value;
            instance.command.executeInsertElementList([
              {
                type: ElementType.CONTROL,
                value: '',
                control: {
                  type,
                  code,
                  value: null,
                  valueSets: JSON.parse(valueSets),
                },
              },
            ]);
          },
        });
        break;
      default:
        break;
    }
  };

  const checkboxDom = document.querySelector<HTMLDivElement>(
    '.menu-item__checkbox'
  )!;
  checkboxDom.onclick = function () {
    console.log('checkbox');
    instance.command.executeInsertElementList([
      {
        type: ElementType.CHECKBOX,
        value: '',
      },
    ]);
  };

  const latexDom = document.querySelector<HTMLDivElement>('.menu-item__latex')!;
  latexDom.onclick = function () {
    console.log('LaTeX');
    new Dialog({
      title: 'LaTeX',
      data: [
        {
          type: 'textarea',
          height: 100,
          name: 'value',
          placeholder: 'LaTeX',
        },
      ],
      onConfirm: payload => {
        const value = payload.find(p => p.name === 'value')?.value;
        if (!value) return;
        instance.command.executeInsertElementList([
          {
            type: ElementType.LATEX,
            value,
          },
        ]);
      },
    });
  };

  const dateDom = document.querySelector<HTMLDivElement>('.menu-item__date')!;
  const dateDomOptionDom = dateDom.querySelector<HTMLDivElement>('.options')!;
  dateDom.onclick = function () {
    console.log('date');
    dateDomOptionDom.classList.toggle('visible');
    const bodyRect = document.body.getBoundingClientRect();
    const dateDomOptionRect = dateDomOptionDom.getBoundingClientRect();
    if (dateDomOptionRect.left + dateDomOptionRect.width > bodyRect.width) {
      dateDomOptionDom.style.right = '0px';
      dateDomOptionDom.style.left = 'unset';
    } else {
      dateDomOptionDom.style.right = 'unset';
      dateDomOptionDom.style.left = '0px';
    }
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    const dateTimeString = `${dateString} ${hour}:${minute}:${second}`;
    dateDomOptionDom.querySelector<HTMLLIElement>('li:first-child')!.innerText =
      dateString;
    dateDomOptionDom.querySelector<HTMLLIElement>('li:last-child')!.innerText =
      dateTimeString;
  };
  dateDomOptionDom.onmousedown = function (evt) {
    const li = evt.target as HTMLLIElement;
    const dateFormat = li.dataset.format!;
    dateDomOptionDom.classList.toggle('visible');
    instance.command.executeInsertElementList([
      {
        type: ElementType.DATE,
        value: '',
        dateFormat,
        valueList: [
          {
            value: li.innerText.trim(),
          },
        ],
      },
    ]);
  };

  const blockDom = document.querySelector<HTMLDivElement>('.menu-item__block')!;
  blockDom.onclick = function () {
    console.log('block');
    new Dialog({
      title: '',
      data: [
        {
          type: 'select',
          label: '',
          name: 'type',
          value: 'iframe',
          required: true,
          options: [
            {
              label: '',
              value: 'iframe',
            },
            {
              label: '',
              value: 'video',
            },
          ],
        },
        {
          type: 'number',
          label: '',
          name: 'width',
          placeholder: '（）',
        },
        {
          type: 'number',
          label: '',
          name: 'height',
          required: true,
          placeholder: '',
        },
        {
          type: 'textarea',
          label: '',
          height: 100,
          name: 'value',
          required: true,
          placeholder: '',
        },
      ],
      onConfirm: payload => {
        const type = payload.find(p => p.name === 'type')?.value;
        if (!type) return;
        const value = payload.find(p => p.name === 'value')?.value;
        if (!value) return;
        const width = payload.find(p => p.name === 'width')?.value;
        const height = payload.find(p => p.name === 'height')?.value;
        if (!height) return;
        const block: IBlock = {
          type: <BlockType>type,
        };
        if (block.type === BlockType.IFRAME) {
          block.iframeBlock = {
            src: value,
          };
        } else if (block.type === BlockType.VIDEO) {
          block.videoBlock = {
            src: value,
          };
        }
        const blockElement: IElement = {
          type: ElementType.BLOCK,
          value: '',
          height: Number(height),
          block,
        };
        if (width) {
          blockElement.width = Number(width);
        }
        instance.command.executeInsertElementList([blockElement]);
      },
    });
  };

  // 5. | & | |
  const searchCollapseDom = document.querySelector<HTMLDivElement>(
    '.menu-item__search__collapse'
  )!;
  const searchInputDom = document.querySelector<HTMLInputElement>(
    '.menu-item__search__collapse__search input'
  )!;
  const replaceInputDom = document.querySelector<HTMLInputElement>(
    '.menu-item__search__collapse__replace input'
  )!;
  const searchDom =
    document.querySelector<HTMLDivElement>('.menu-item__search')!;
  searchDom.title = `(${isApple ? '⌘' : 'Ctrl'}+F)`;
  const searchResultDom =
    searchCollapseDom.querySelector<HTMLLabelElement>('.search-result')!;
  function setSearchResult() {
    const result = instance.command.getSearchNavigateInfo();
    if (result) {
      const { index, count } = result;
      searchResultDom.innerText = `${index}/${count}`;
    } else {
      searchResultDom.innerText = '';
    }
  }
  searchDom.onclick = function () {
    console.log('search');
    searchCollapseDom.style.display = 'block';
    const bodyRect = document.body.getBoundingClientRect();
    const searchRect = searchDom.getBoundingClientRect();
    const searchCollapseRect = searchCollapseDom.getBoundingClientRect();
    if (searchRect.left + searchCollapseRect.width > bodyRect.width) {
      searchCollapseDom.style.right = '0px';
      searchCollapseDom.style.left = 'unset';
    } else {
      searchCollapseDom.style.right = 'unset';
    }
    searchInputDom.focus();
  };
  searchCollapseDom.querySelector<HTMLSpanElement>('span')!.onclick =
    function () {
      searchCollapseDom.style.display = 'none';
      searchInputDom.value = '';
      replaceInputDom.value = '';
      instance.command.executeSearch(null);
      setSearchResult();
    };
  searchInputDom.oninput = function () {
    instance.command.executeSearch(searchInputDom.value || null);
    setSearchResult();
  };
  searchInputDom.onkeydown = function (evt) {
    if (evt.key === 'Enter') {
      instance.command.executeSearch(searchInputDom.value || null);
      setSearchResult();
    }
  };
  searchCollapseDom.querySelector<HTMLButtonElement>('button')!.onclick =
    function () {
      const searchValue = searchInputDom.value;
      const replaceValue = replaceInputDom.value;
      if (searchValue && replaceValue && searchValue !== replaceValue) {
        instance.command.executeReplace(replaceValue);
      }
    };
  searchCollapseDom.querySelector<HTMLDivElement>('.arrow-left')!.onclick =
    function () {
      instance.command.executeSearchNavigatePre();
      setSearchResult();
    };
  searchCollapseDom.querySelector<HTMLDivElement>('.arrow-right')!.onclick =
    function () {
      instance.command.executeSearchNavigateNext();
      setSearchResult();
    };

  const printDom = document.querySelector<HTMLDivElement>('.menu-item__print')!;
  printDom.title = `(${isApple ? '⌘' : 'Ctrl'}+P)`;
  printDom.onclick = function () {
    console.log('print');
    instance.command.executePrint();
  };

  // 6. | | | | | |
  async function updateCatalog() {
    const catalog = await instance.command.getCatalog();
    const catalogMainDom =
      document.querySelector<HTMLDivElement>('.catalog__main')!;
    catalogMainDom.innerHTML = '';
    if (catalog) {
      const appendCatalog = (
        parent: HTMLDivElement,
        catalogItems: ICatalogItem[]
      ) => {
        for (let c = 0; c < catalogItems.length; c++) {
          const catalogItem = catalogItems[c];
          const catalogItemDom = document.createElement('div');
          catalogItemDom.classList.add('catalog-item');
          const catalogItemContentDom = document.createElement('div');
          catalogItemContentDom.classList.add('catalog-item__content');
          const catalogItemContentSpanDom = document.createElement('span');
          catalogItemContentSpanDom.innerText = catalogItem.name;
          catalogItemContentDom.append(catalogItemContentSpanDom);
          catalogItemContentDom.onclick = () => {
            instance.command.executeLocationCatalog(catalogItem.id);
          };
          catalogItemDom.append(catalogItemContentDom);
          if (catalogItem.subCatalog && catalogItem.subCatalog.length) {
            appendCatalog(catalogItemDom, catalogItem.subCatalog);
          }
          parent.append(catalogItemDom);
        }
      };
      appendCatalog(catalogMainDom, catalog);
    }
  }
  let isCatalogShow = true;
  const catalogDom = document.querySelector<HTMLElement>('.catalog')!;
  const catalogModeDom =
    document.querySelector<HTMLDivElement>('.catalog-mode')!;
  const catalogHeaderCloseDom = document.querySelector<HTMLDivElement>(
    '.catalog__header__close'
  )!;
  const switchCatalog = () => {
    isCatalogShow = !isCatalogShow;
    if (isCatalogShow) {
      catalogDom.style.display = 'block';
      updateCatalog();
    } else {
      catalogDom.style.display = 'none';
    }
  };
  catalogModeDom.onclick = switchCatalog;
  catalogHeaderCloseDom.onclick = switchCatalog;

  const pageModeDom = document.querySelector<HTMLDivElement>('.page-mode')!;
  const pageModeOptionsDom =
    pageModeDom.querySelector<HTMLDivElement>('.options')!;
  pageModeDom.onclick = function () {
    pageModeOptionsDom.classList.toggle('visible');
  };
  pageModeOptionsDom.onclick = function (evt) {
    const li = evt.target as HTMLLIElement;
    instance.command.executePageMode(<PageMode>li.dataset.pageMode!);
  };

  document.querySelector<HTMLDivElement>('.page-scale-percentage')!.onclick =
    function () {
      console.log('page-scale-recovery');
      instance.command.executePageScaleRecovery();
    };

  document.querySelector<HTMLDivElement>('.page-scale-minus')!.onclick =
    function () {
      console.log('page-scale-minus');
      instance.command.executePageScaleMinus();
    };

  document.querySelector<HTMLDivElement>('.page-scale-add')!.onclick =
    function () {
      console.log('page-scale-add');
      instance.command.executePageScaleAdd();
    };

  const paperSizeDom = document.querySelector<HTMLDivElement>('.paper-size')!;
  const paperSizeDomOptionsDom =
    paperSizeDom.querySelector<HTMLDivElement>('.options')!;
  paperSizeDom.onclick = function () {
    paperSizeDomOptionsDom.classList.toggle('visible');
  };
  paperSizeDomOptionsDom.onclick = function (evt) {
    const li = evt.target as HTMLLIElement;
    const paperType = li.dataset.paperSize!;
    const [width, height] = paperType.split('*').map(Number);
    instance.command.executePaperSize(width, height);
    paperSizeDomOptionsDom
      .querySelectorAll('li')
      .forEach(child => child.classList.remove('active'));
    li.classList.add('active');
  };

  const paperDirectionDom =
    document.querySelector<HTMLDivElement>('.paper-direction')!;
  const paperDirectionDomOptionsDom =
    paperDirectionDom.querySelector<HTMLDivElement>('.options')!;
  paperDirectionDom.onclick = function () {
    paperDirectionDomOptionsDom.classList.toggle('visible');
  };
  paperDirectionDomOptionsDom.onclick = function (evt) {
    const li = evt.target as HTMLLIElement;
    const paperDirection = li.dataset.paperDirection!;
    instance.command.executePaperDirection(<PaperDirection>paperDirection);
    paperDirectionDomOptionsDom
      .querySelectorAll('li')
      .forEach(child => child.classList.remove('active'));
    li.classList.add('active');
  };

  const paperMarginDom =
    document.querySelector<HTMLDivElement>('.paper-margin')!;
  paperMarginDom.onclick = function () {
    const [topMargin, rightMargin, bottomMargin, leftMargin] =
      instance.command.getPaperMargin();
    new Dialog({
      title: '',
      data: [
        {
          type: 'text',
          label: '',
          name: 'top',
          required: true,
          value: `${topMargin}`,
          placeholder: '',
        },
        {
          type: 'text',
          label: '',
          name: 'bottom',
          required: true,
          value: `${bottomMargin}`,
          placeholder: '',
        },
        {
          type: 'text',
          label: '',
          name: 'left',
          required: true,
          value: `${leftMargin}`,
          placeholder: '',
        },
        {
          type: 'text',
          label: '',
          name: 'right',
          required: true,
          value: `${rightMargin}`,
          placeholder: '',
        },
      ],
      onConfirm: payload => {
        const top = payload.find(p => p.name === 'top')?.value;
        if (!top) return;
        const bottom = payload.find(p => p.name === 'bottom')?.value;
        if (!bottom) return;
        const left = payload.find(p => p.name === 'left')?.value;
        if (!left) return;
        const right = payload.find(p => p.name === 'right')?.value;
        if (!right) return;
        instance.command.executeSetPaperMargin([
          Number(top),
          Number(right),
          Number(bottom),
          Number(left),
        ]);
      },
    });
  };

  const fullscreenDom = document.querySelector<HTMLDivElement>('.fullscreen')!;
  fullscreenDom.onclick = toggleFullscreen;
  window.addEventListener('keydown', evt => {
    if (evt.key === 'F11') {
      toggleFullscreen();
      evt.preventDefault();
    }
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreenDom.classList.toggle('exist');
  });
  function toggleFullscreen() {
    console.log('fullscreen');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // 7. Editor Modes
  let modeIndex = 0;
  const modeList = [
    {
      mode: EditorMode.EDIT,
      name: EditorMode.EDIT,
    },
    {
      mode: EditorMode.CLEAN,
      name: EditorMode.CLEAN,
    },
    {
      mode: EditorMode.READONLY,
      name: EditorMode.READONLY,
    },
  ];
  const modeElement = document.querySelector<HTMLDivElement>('.editor-mode')!;
  modeElement.onclick = function () {
    modeIndex === modeList.length - 1 ? (modeIndex = 0) : modeIndex++;
    const { name, mode } = modeList[modeIndex];
    modeElement.innerText = name;
    instance.command.executeMode(mode);
    const isReadonly = mode === EditorMode.READONLY;
    const enableMenuList = ['search', 'print'];
    document.querySelectorAll<HTMLDivElement>('.menu-item>div').forEach(dom => {
      const menu = dom.dataset.menu;
      isReadonly && (!menu || !enableMenuList.includes(menu))
        ? dom.classList.add('disable')
        : dom.classList.remove('disable');
    });
  };

  // 8.
  instance.listener.rangeStyleChange = function (payload) {
    payload.type === ElementType.SUBSCRIPT
      ? subscriptDom.classList.add('active')
      : subscriptDom.classList.remove('active');
    payload.type === ElementType.SUPERSCRIPT
      ? superscriptDom.classList.add('active')
      : superscriptDom.classList.remove('active');
    payload.type === ElementType.SEPARATOR
      ? separatorDom.classList.add('active')
      : separatorDom.classList.remove('active');
    separatorOptionDom
      .querySelectorAll('li')
      .forEach(li => li.classList.remove('active'));
    if (payload.type === ElementType.SEPARATOR) {
      const separator = payload.dashArray.join(',') || '0,0';
      const curSeparatorDom = separatorOptionDom.querySelector<HTMLLIElement>(
        `[data-separator='${separator}']`
      )!;
      if (curSeparatorDom) {
        curSeparatorDom.classList.add('active');
      }
    }

    fontOptionDom
      .querySelectorAll<HTMLLIElement>('li')
      .forEach(li => li.classList.remove('active'));
    const curFontDom = fontOptionDom.querySelector<HTMLLIElement>(
      `[data-family='${payload.font}']`
    );
    if (curFontDom) {
      fontSelectDom.innerText = curFontDom.innerText;
      fontSelectDom.style.fontFamily = payload.font;
      curFontDom.classList.add('active');
    }
    sizeOptionDom
      .querySelectorAll<HTMLLIElement>('li')
      .forEach(li => li.classList.remove('active'));
    const curSizeDom = sizeOptionDom.querySelector<HTMLLIElement>(
      `[data-size='${payload.size}']`
    );
    if (curSizeDom) {
      sizeSelectDom.innerText = curSizeDom.innerText;
      curSizeDom.classList.add('active');
    } else {
      sizeSelectDom.innerText = `${payload.size}`;
    }
    payload.bold
      ? boldDom.classList.add('active')
      : boldDom.classList.remove('active');
    payload.italic
      ? italicDom.classList.add('active')
      : italicDom.classList.remove('active');
    payload.underline
      ? underlineDom.classList.add('active')
      : underlineDom.classList.remove('active');
    payload.strikeout
      ? strikeoutDom.classList.add('active')
      : strikeoutDom.classList.remove('active');
    if (payload.color) {
      colorDom.classList.add('active');
      colorControlDom.value = payload.color;
      colorSpanDom.style.backgroundColor = payload.color;
    } else {
      colorDom.classList.remove('active');
      colorControlDom.value = '#000000';
      colorSpanDom.style.backgroundColor = '#000000';
    }
    if (payload.highlight) {
      highlightDom.classList.add('active');
      highlightControlDom.value = payload.highlight;
      highlightSpanDom.style.backgroundColor = payload.highlight;
    } else {
      highlightDom.classList.remove('active');
      highlightControlDom.value = '#ffff00';
      highlightSpanDom.style.backgroundColor = '#ffff00';
    }

    // row layout
    leftDom.classList.remove('active');
    centerDom.classList.remove('active');
    rightDom.classList.remove('active');
    alignmentDom.classList.remove('active');
    if (payload.rowFlex && payload.rowFlex === 'right') {
      rightDom.classList.add('active');
    } else if (payload.rowFlex && payload.rowFlex === 'center') {
      centerDom.classList.add('active');
    } else if (payload.rowFlex && payload.rowFlex === 'alignment') {
      alignmentDom.classList.add('active');
    } else {
      leftDom.classList.add('active');
    }

    // Line space
    rowOptionDom
      .querySelectorAll<HTMLLIElement>('li')
      .forEach(li => li.classList.remove('active'));
    const curRowMarginDom = rowOptionDom.querySelector<HTMLLIElement>(
      `[data-rowmargin='${payload.rowMargin}']`
    )!;
    curRowMarginDom.classList.add('active');

    // Function
    payload.undo
      ? undoDom.classList.remove('no-allow')
      : undoDom.classList.add('no-allow');
    payload.redo
      ? redoDom.classList.remove('no-allow')
      : redoDom.classList.add('no-allow');
    payload.painter
      ? painterDom.classList.add('active')
      : painterDom.classList.remove('active');

    // Title
    titleOptionDom
      .querySelectorAll<HTMLLIElement>('li')
      .forEach(li => li.classList.remove('active'));
    if (payload.level) {
      const curTitleDom = titleOptionDom.querySelector<HTMLLIElement>(
        `[data-level='${payload.level}']`
      )!;
      titleSelectDom.innerText = curTitleDom.innerText;
      curTitleDom.classList.add('active');
    } else {
      titleSelectDom.innerText = '';
      titleOptionDom.querySelector('li:first-child')!.classList.add('active');
    }

    // Lists
    listOptionDom
      .querySelectorAll<HTMLLIElement>('li')
      .forEach(li => li.classList.remove('active'));
    if (payload.listType) {
      listDom.classList.add('active');
      const listType = payload.listType;
      const listStyle =
        payload.listType === ListType.OL ? ListStyle.DECIMAL : payload.listType;
      const curListDom = listOptionDom.querySelector<HTMLLIElement>(
        `[data-list-type='${listType}'][data-list-style='${listStyle}']`
      );
      if (curListDom) {
        curListDom.classList.add('active');
      }
    } else {
      listDom.classList.remove('active');
    }
  };

  instance.listener.visiblePageNoListChange = function (payload) {
    const text = payload.map(i => i + 1).join('、');
    document.querySelector<HTMLSpanElement>('.page-no-list')!.innerText = text;
  };

  instance.listener.pageSizeChange = function (payload) {
    document.querySelector<HTMLSpanElement>('.page-size')!.innerText =
      `${payload}`;
  };

  instance.listener.intersectionPageNoChange = function (payload) {
    document.querySelector<HTMLSpanElement>('.page-no')!.innerText = `${
      payload + 1
    }`;
  };

  instance.listener.pageScaleChange = function (payload) {
    document.querySelector<HTMLSpanElement>(
      '.page-scale-percentage'
    )!.innerText = `${Math.floor(payload * 10 * 10)}%`;
  };

  instance.listener.controlChange = function (payload) {
    const disableMenusInControlContext = [
      'superscript',
      'subscript',
      'table',
      'image',
      'hyperlink',
      'separator',
      'codeblock',
      'page-break',
      'control',
      'checkbox',
    ];
    // Menu Control
    disableMenusInControlContext.forEach(menu => {
      const menuDom = document.querySelector<HTMLDivElement>(
        `.menu-item__${menu}`
      )!;
      payload
        ? menuDom.classList.add('disable')
        : menuDom.classList.remove('disable');
    });
  };

  instance.listener.pageModeChange = function (payload) {
    const activeMode = pageModeOptionsDom.querySelector<HTMLLIElement>(
      `[data-page-mode='${payload}']`
    )!;
    pageModeOptionsDom
      .querySelectorAll('li')
      .forEach(li => li.classList.remove('active'));
    activeMode.classList.add('active');
  };

  const handleContentChange = async function () {
    const wordCount = await instance.command.getWordCount();
    document.querySelector<HTMLSpanElement>('.word-count')!.innerText = `${
      wordCount || 0
    }`;
    // Table of contents
    if (isCatalogShow) {
      updateCatalog();
    }
  };
  instance.listener.contentChange = debounce(handleContentChange, 200);
  handleContentChange();

  instance.listener.saved = function (payload) {
    console.log('elementList: ', payload);
  };

  // 9. Register right click menu
  instance.register.contextMenuList([
    {
      name: 'Signature',
      icon: 'signature',
      when: payload => {
        return !payload.isReadonly && payload.editorTextFocus;
      },
      callback: (command: Command) => {
        new Signature({
          onConfirm(payload) {
            if (!payload) return;
            const { value, width, height } = payload;
            if (!value || !width || !height) return;
            command.executeInsertElementList([
              {
                value,
                width,
                height,
                type: ElementType.IMAGE,
              },
            ]);
          },
        });
      },
    },
    {
      name: 'Format',
      icon: 'word-tool',
      when: payload => {
        return !payload.isReadonly;
      },
      callback: (command: Command) => {
        command.executeWordTool();
      },
    },
  ]);

  // 10. Shortcut registration
  instance.register.shortcutList([
    {
      key: KeyMap.P,
      mod: true,
      isGlobal: true,
      callback: (command: Command) => {
        command.executePrint();
      },
    },
    {
      key: KeyMap.F,
      mod: true,
      isGlobal: true,
      callback: (command: Command) => {
        const text = command.getRangeText();
        searchDom.click();
        if (text) {
          searchInputDom.value = text;
          instance.command.executeSearch(text);
          setSearchResult();
        }
      },
    },
    {
      key: KeyMap.MINUS,
      ctrl: true,
      isGlobal: true,
      callback: (command: Command) => {
        command.executePageScaleMinus();
      },
    },
    {
      key: KeyMap.EQUAL,
      ctrl: true,
      isGlobal: true,
      callback: (command: Command) => {
        command.executePageScaleAdd();
      },
    },
    {
      key: KeyMap.ZERO,
      ctrl: true,
      isGlobal: true,
      callback: (command: Command) => {
        command.executePageScaleRecovery();
      },
    },
  ]);
};
