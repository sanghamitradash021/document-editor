import { ElementType, RowFlex, VerticalAlign } from '../..';
import { ZERO } from '../../dataset/constant/Common';
import { ControlComponent, ImageDisplay } from '../../dataset/enum/Control';
import {
  IComputePageRowPositionPayload,
  IComputePageRowPositionResult,
} from '../../interface/Position';
import { IEditorOption } from '../../interface/Editor';
import { IElement, IElementPosition } from '../../interface/Element';
import {
  ICurrentPosition,
  IGetPositionByXYPayload,
  IPositionContext,
} from '../../interface/Position';
import { Draw } from '../draw/Draw';
import { EditorMode, EditorZone } from '../../dataset/enum/Editor';

export class Position {
  private cursorPosition: IElementPosition | null;
  private positionContext: IPositionContext;
  private positionList: IElementPosition[];

  private draw: Draw;
  private options: Required<IEditorOption>;

  constructor(draw: Draw) {
    this.positionList = [];
    this.cursorPosition = null;
    this.positionContext = {
      isTable: false,
      isControl: false,
    };

    this.draw = draw;
    this.options = draw.getOptions();
  }

  public getTablePositionList(
    sourceElementList: IElement[]
  ): IElementPosition[] {
    const { index, trIndex, tdIndex } = this.positionContext;
    return (
      sourceElementList[index!].trList![trIndex!].tdList[tdIndex!]
        .positionList || []
    );
  }

  public getPositionList(): IElementPosition[] {
    return this.positionContext.isTable
      ? this.getTablePositionList(this.draw.getOriginalElementList())
      : this.getOriginalPositionList();
  }

  public getMainPositionList(): IElementPosition[] {
    return this.positionContext.isTable
      ? this.getTablePositionList(this.draw.getOriginalMainElementList())
      : this.positionList;
  }

  public getOriginalPositionList(): IElementPosition[] {
    const zoneManager = this.draw.getZone();
    if (zoneManager.isHeaderActive()) {
      const header = this.draw.getHeader();
      return header.getPositionList();
    }
    if (zoneManager.isFooterActive()) {
      const footer = this.draw.getFooter();
      return footer.getPositionList();
    }
    return this.positionList;
  }

  public getOriginalMainPositionList(): IElementPosition[] {
    return this.positionList;
  }

  public setPositionList(payload: IElementPosition[]) {
    this.positionList = payload;
  }

  public computePageRowPosition(
    payload: IComputePageRowPositionPayload
  ): IComputePageRowPositionResult {
    const {
      positionList,
      rowList,
      pageNo,
      startX,
      startY,
      startRowIndex,
      startIndex,
      innerWidth,
    } = payload;
    const { scale, tdPadding } = this.options;
    let x = startX;
    let y = startY;
    let index = startIndex;
    for (let i = 0; i < rowList.length; i++) {
      const curRow = rowList[i];
      if (curRow.rowFlex === RowFlex.CENTER) {
        x += (innerWidth - curRow.width) / 2;
      } else if (curRow.rowFlex === RowFlex.RIGHT) {
        x += innerWidth - curRow.width;
      }
      // -
      if (curRow.isList) {
        x += curRow.offsetX || 0;
      }
      // td
      const tablePreX = x;
      const tablePreY = y;
      for (let j = 0; j < curRow.elementList.length; j++) {
        const element = curRow.elementList[j];
        const metrics = element.metrics;
        const offsetY =
          (element.imgDisplay !== ImageDisplay.INLINE &&
            element.type === ElementType.IMAGE) ||
          element.type === ElementType.LATEX
            ? curRow.ascent - metrics.height
            : curRow.ascent;
        const positionItem: IElementPosition = {
          pageNo,
          index,
          value: element.value,
          rowIndex: startRowIndex + i,
          rowNo: i,
          metrics,
          ascent: offsetY,
          lineHeight: curRow.height,
          isFirstLetter: j === 0,
          isLastLetter: j === curRow.elementList.length - 1,
          coordinate: {
            leftTop: [x, y],
            leftBottom: [x, y + curRow.height],
            rightTop: [x + metrics.width, y],
            rightBottom: [x + metrics.width, y + curRow.height],
          },
        };
        positionList.push(positionItem);
        index++;
        x += metrics.width;
        if (element.type === ElementType.TABLE) {
          const tdGap = tdPadding * 2;
          for (let t = 0; t < element.trList!.length; t++) {
            const tr = element.trList![t];
            for (let d = 0; d < tr.tdList!.length; d++) {
              const td = tr.tdList[d];
              td.positionList = [];
              const rowList = td.rowList!;
              const drawRowResult = this.computePageRowPosition({
                positionList: td.positionList,
                rowList,
                pageNo,
                startRowIndex: 0,
                startIndex: 0,
                startX: (td.x! + tdPadding) * scale + tablePreX,
                startY: td.y! * scale + tablePreY,
                innerWidth: (td.width! - tdGap) * scale,
              });
              if (
                td.verticalAlign === VerticalAlign.MIDDLE ||
                td.verticalAlign === VerticalAlign.BOTTOM
              ) {
                const rowsHeight = rowList.reduce(
                  (pre, cur) => pre + cur.height,
                  0
                );
                const blankHeight = (td.height! - tdGap) * scale - rowsHeight;
                const offsetHeight =
                  td.verticalAlign === VerticalAlign.MIDDLE
                    ? blankHeight / 2
                    : blankHeight;
                if (Math.floor(offsetHeight) > 0) {
                  td.positionList.forEach(tdPosition => {
                    const {
                      coordinate: {
                        leftTop,
                        leftBottom,
                        rightBottom,
                        rightTop,
                      },
                    } = tdPosition;
                    leftTop[1] += offsetHeight;
                    leftBottom[1] += offsetHeight;
                    rightBottom[1] += offsetHeight;
                    rightTop[1] += offsetHeight;
                  });
                }
              }
              x = drawRowResult.x;
              y = drawRowResult.y;
            }
          }
          // x、y
          x = tablePreX;
          y = tablePreY;
        }
      }
      x = startX;
      y += curRow.height;
    }
    return { x, y, index };
  }

  public computePositionList() {
    this.positionList = [];
    const innerWidth = this.draw.getInnerWidth();
    const pageRowList = this.draw.getPageRowList();
    const margins = this.draw.getMargins();
    const startX = margins[3];
    const header = this.draw.getHeader();
    const extraHeight = header.getExtraHeight();
    const startY = margins[0] + extraHeight;
    let startRowIndex = 0;
    for (let i = 0; i < pageRowList.length; i++) {
      const rowList = pageRowList[i];
      const startIndex = rowList[0].startIndex;
      this.computePageRowPosition({
        positionList: this.positionList,
        rowList,
        pageNo: i,
        startRowIndex,
        startIndex,
        startX,
        startY,
        innerWidth,
      });
      startRowIndex += rowList.length;
    }
  }

  public setCursorPosition(position: IElementPosition | null) {
    this.cursorPosition = position;
  }

  public getCursorPosition(): IElementPosition | null {
    return this.cursorPosition;
  }

  public getPositionContext(): IPositionContext {
    return this.positionContext;
  }

  public setPositionContext(payload: IPositionContext) {
    this.positionContext = payload;
  }

  public getPositionByXY(payload: IGetPositionByXYPayload): ICurrentPosition {
    const { x, y, isTable } = payload;
    let { elementList, positionList } = payload;
    if (!elementList) {
      elementList = this.draw.getOriginalElementList();
    }
    if (!positionList) {
      positionList = this.getOriginalPositionList();
    }
    const zoneManager = this.draw.getZone();
    const curPageNo = this.draw.getPageNo();
    const isMainActive = zoneManager.isMainActive();
    const positionNo = isMainActive ? curPageNo : 0;
    for (let j = 0; j < positionList.length; j++) {
      const {
        index,
        pageNo,
        isFirstLetter,
        coordinate: { leftTop, rightTop, leftBottom },
      } = positionList[j];
      if (positionNo !== pageNo) continue;
      if (
        leftTop[0] <= x &&
        rightTop[0] >= x &&
        leftTop[1] <= y &&
        leftBottom[1] >= y
      ) {
        let curPositionIndex = j;
        const element = elementList[j];
        if (element.type === ElementType.TABLE) {
          for (let t = 0; t < element.trList!.length; t++) {
            const tr = element.trList![t];
            for (let d = 0; d < tr.tdList.length; d++) {
              const td = tr.tdList[d];
              const tablePosition = this.getPositionByXY({
                x,
                y,
                td,
                tablePosition: positionList[j],
                isTable: true,
                elementList: td.value,
                positionList: td.positionList,
              });
              if (~tablePosition.index) {
                const { index: tdValueIndex, hitLineStartIndex } =
                  tablePosition;
                const tdValueElement = td.value[tdValueIndex];
                return {
                  index,
                  isCheckbox:
                    tdValueElement.type === ElementType.CHECKBOX ||
                    tdValueElement.controlComponent ===
                      ControlComponent.CHECKBOX,
                  isControl: tdValueElement.type === ElementType.CONTROL,
                  isImage: tablePosition.isImage,
                  isDirectHit: tablePosition.isDirectHit,
                  isTable: true,
                  tdIndex: d,
                  trIndex: t,
                  tdValueIndex,
                  tdId: td.id,
                  trId: tr.id,
                  tableId: element.id,
                  hitLineStartIndex,
                };
              }
            }
          }
        }
        if (
          element.type === ElementType.IMAGE ||
          element.type === ElementType.LATEX
        ) {
          return {
            index: curPositionIndex,
            isDirectHit: true,
            isImage: true,
          };
        }
        if (
          element.type === ElementType.CHECKBOX ||
          element.controlComponent === ControlComponent.CHECKBOX
        ) {
          return {
            index: curPositionIndex,
            isDirectHit: true,
            isCheckbox: true,
          };
        }
        let hitLineStartIndex: number | undefined;
        if (elementList[index].value !== ZERO) {
          const valueWidth = rightTop[0] - leftTop[0];
          if (x < leftTop[0] + valueWidth / 2) {
            curPositionIndex = j - 1;
            if (isFirstLetter) {
              hitLineStartIndex = j;
            }
          }
        }
        return {
          hitLineStartIndex,
          index: curPositionIndex,
          isControl: element.type === ElementType.CONTROL,
        };
      }
    }
    let isLastArea = false;
    let curPositionIndex = -1;
    let hitLineStartIndex: number | undefined;
    if (isTable) {
      const { scale } = this.options;
      const { td, tablePosition } = payload;
      if (td && tablePosition) {
        const { leftTop } = tablePosition.coordinate;
        const tdX = td.x! * scale + leftTop[0];
        const tdY = td.y! * scale + leftTop[1];
        const tdWidth = td.width! * scale;
        const tdHeight = td.height! * scale;
        if (!(tdX < x && x < tdX + tdWidth && tdY < y && y < tdY + tdHeight)) {
          return {
            index: curPositionIndex,
          };
        }
      }
    }
    const lastLetterList = positionList.filter(
      p => p.isLastLetter && p.pageNo === positionNo
    );
    for (let j = 0; j < lastLetterList.length; j++) {
      const {
        index,
        pageNo,
        coordinate: { leftTop, leftBottom },
      } = lastLetterList[j];
      if (positionNo !== pageNo) continue;
      if (y > leftTop[1] && y <= leftBottom[1]) {
        const isHead = x < this.options.margins[3];
        if (isHead) {
          const headIndex = positionList.findIndex(
            p => p.pageNo === positionNo && p.rowNo === lastLetterList[j].rowNo
          );
          if (~headIndex) {
            if (positionList[headIndex].value === ZERO) {
              curPositionIndex = headIndex;
            } else {
              curPositionIndex = headIndex - 1;
              hitLineStartIndex = headIndex;
            }
          } else {
            curPositionIndex = index;
          }
        } else {
          curPositionIndex = index;
        }
        isLastArea = true;
        break;
      }
    }
    if (!isLastArea) {
      const header = this.draw.getHeader();
      const headerBottomY = header.getHeaderTop() + header.getHeight();
      const footer = this.draw.getFooter();
      const pageHeight = this.draw.getHeight();
      const footerTopY =
        pageHeight - (footer.getFooterBottom() + footer.getHeight());
      if (isMainActive) {
        if (y < headerBottomY) {
          return {
            index: -1,
            zone: EditorZone.HEADER,
          };
        }
        if (y > footerTopY) {
          return {
            index: -1,
            zone: EditorZone.FOOTER,
          };
        }
      } else {
        // main： &&
        if (y <= footerTopY && y >= headerBottomY) {
          return {
            index: -1,
            zone: EditorZone.MAIN,
          };
        }
      }
      return {
        index:
          lastLetterList[lastLetterList.length - 1]?.index ||
          positionList.length - 1,
      };
    }
    return {
      hitLineStartIndex,
      index: curPositionIndex,
      isControl: elementList[curPositionIndex]?.type === ElementType.CONTROL,
    };
  }

  public adjustPositionContext(
    payload: IGetPositionByXYPayload
  ): ICurrentPosition | null {
    const positionResult = this.getPositionByXY(payload);
    if (!~positionResult.index) return null;
    if (
      positionResult.isControl &&
      this.draw.getMode() !== EditorMode.READONLY
    ) {
      const { index, isTable, trIndex, tdIndex, tdValueIndex } = positionResult;
      const control = this.draw.getControl();
      const { newIndex } = control.moveCursor({
        index,
        isTable,
        trIndex,
        tdIndex,
        tdValueIndex,
      });
      if (isTable) {
        positionResult.tdValueIndex = newIndex;
      } else {
        positionResult.index = newIndex;
      }
    }
    const {
      index,
      isCheckbox,
      isControl,
      isTable,
      trIndex,
      tdIndex,
      tdId,
      trId,
      tableId,
    } = positionResult;
    this.setPositionContext({
      isTable: isTable || false,
      isCheckbox: isCheckbox || false,
      isControl: isControl || false,
      index,
      trIndex,
      tdIndex,
      tdId,
      trId,
      tableId,
    });
    return positionResult;
  }
}
