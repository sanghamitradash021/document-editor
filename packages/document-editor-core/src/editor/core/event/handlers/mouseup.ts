import { EDITOR_ELEMENT_STYLE_ATTR } from '../../../dataset/constant/Element';
import { ControlComponent, ControlType } from '../../../dataset/enum/Control';
import { ElementType } from '../../../dataset/enum/Element';
import { IElement } from '../../../interface/Element';
import { deepClone, getUUID } from '../../../utils';
import {
  formatElementContext,
  formatElementList,
} from '../../../utils/element';
import { CanvasEvent } from '../CanvasEvent';

type IDragElement = IElement & { dragId: string };

function createDragId(element: IElement): string {
  const dragId = getUUID();
  Reflect.set(element, 'dragId', dragId);
  return dragId;
}

function getElementIndexByDragId(dragId: string, elementList: IElement[]) {
  return (<IDragElement[]>elementList).findIndex(el => el.dragId === dragId);
}

export function mouseup(evt: MouseEvent, host: CanvasEvent) {
  if (host.isAllowDrop) {
    const draw = host.getDraw();
    if (draw.isReadonly()) return;
    const position = draw.getPosition();
    const positionList = position.getPositionList();
    const rangeManager = draw.getRange();
    const cacheRange = host.cacheRange!;
    const cacheElementList = host.cacheElementList!;
    const cachePositionList = host.cachePositionList!;
    const range = rangeManager.getRange();
    // -
    if (
      range.startIndex >= cacheRange.startIndex &&
      range.endIndex <= cacheRange.endIndex
    ) {
      rangeManager.replaceRange({
        ...cacheRange,
      });
      draw.render({
        isSetCursor: false,
        isCompute: false,
        isSubmitHistory: false,
      });
      return;
    }
    const dragElementList = cacheElementList.slice(
      cacheRange.startIndex + 1,
      cacheRange.endIndex + 1
    );
    const isContainControl = dragElementList.find(
      element => element.type === ElementType.CONTROL
    );
    if (isContainControl) {
      // (/ || || )
      const cacheStartElement = cacheElementList[cacheRange.startIndex + 1];
      const cacheEndElement = cacheElementList[cacheRange.endIndex];
      const isAllowDragControl =
        ((cacheStartElement.type !== ElementType.CONTROL ||
          cacheStartElement.controlComponent === ControlComponent.PREFIX) &&
          (cacheEndElement.type !== ElementType.CONTROL ||
            cacheEndElement.controlComponent === ControlComponent.POSTFIX)) ||
        (cacheStartElement.controlId === cacheEndElement.controlId &&
          cacheStartElement.controlComponent === ControlComponent.PREFIX &&
          cacheEndElement.controlComponent === ControlComponent.POSTFIX) ||
        (cacheStartElement.control?.type === ControlType.TEXT &&
          cacheStartElement.controlComponent === ControlComponent.VALUE &&
          cacheEndElement.control?.type === ControlType.TEXT &&
          cacheEndElement.controlComponent === ControlComponent.VALUE);
      if (!isAllowDragControl) {
        draw.render({
          curIndex: range.startIndex,
          isCompute: false,
          isSubmitHistory: false,
        });
        return;
      }
    }
    const editorOptions = draw.getOptions();
    const elementList = draw.getElementList();
    const replaceElementList = dragElementList.map(el => {
      if (
        !el.type ||
        el.type === ElementType.TEXT ||
        el.control?.type === ControlType.TEXT
      ) {
        const newElement: IElement = {
          value: el.value,
        };
        EDITOR_ELEMENT_STYLE_ATTR.forEach(attr => {
          const value = el[attr] as never;
          if (value !== undefined) {
            newElement[attr] = value;
          }
        });
        return newElement;
      } else {
        const newElement = deepClone(el);
        formatElementList([newElement], {
          isHandleFirstElement: false,
          editorOptions,
        });
        return newElement;
      }
    });
    formatElementContext(elementList, replaceElementList, range.startIndex);
    // id
    const cacheRangeStartId = createDragId(
      cacheElementList[cacheRange.startIndex]
    );
    const cacheRangeEndId = createDragId(cacheElementList[cacheRange.endIndex]);
    const replaceLength = replaceElementList.length;
    let rangeStart = range.startIndex;
    let rangeEnd = rangeStart + replaceLength;
    const control = draw.getControl();
    const activeControl = control.getActiveControl();
    if (
      activeControl &&
      cacheElementList[rangeStart].controlComponent !== ControlComponent.POSTFIX
    ) {
      rangeEnd = activeControl.setValue(replaceElementList);
      rangeStart = rangeEnd - replaceLength;
    } else {
      draw.spliceElementList(
        elementList,
        rangeStart + 1,
        0,
        ...replaceElementList
      );
    }
    if (!~rangeEnd) {
      draw.render({
        isSetCursor: false,
      });
      return;
    }
    // id
    const rangeStartId = createDragId(elementList[rangeStart]);
    const rangeEndId = createDragId(elementList[rangeEnd]);
    const cacheRangeStartIndex = getElementIndexByDragId(
      cacheRangeStartId,
      cacheElementList
    );
    const cacheRangeEndIndex = getElementIndexByDragId(
      cacheRangeEndId,
      cacheElementList
    );
    const cacheEndElement = cacheElementList[cacheRangeEndIndex];
    if (
      cacheEndElement.type === ElementType.CONTROL &&
      cacheEndElement.controlComponent !== ControlComponent.POSTFIX
    ) {
      rangeManager.replaceRange({
        ...cacheRange,
        startIndex: cacheRangeStartIndex,
        endIndex: cacheRangeEndIndex,
      });
      control.getActiveControl()?.cut();
    } else {
      draw.spliceElementList(
        cacheElementList,
        cacheRangeStartIndex + 1,
        cacheRangeEndIndex - cacheRangeStartIndex
      );
    }
    const startElement = elementList[range.startIndex];
    const cacheStartElement = cacheElementList[cacheRange.startIndex];
    const startPosition = positionList[range.startIndex];
    const cacheStartPosition = cachePositionList[cacheRange.startIndex];
    const positionContext = position.getPositionContext();
    let positionContextIndex = positionContext.index;
    if (positionContextIndex) {
      if (startElement.tableId && !cacheStartElement.tableId) {
        // &&
        if (cacheStartPosition.index < positionContextIndex) {
          positionContextIndex -= replaceLength;
        }
      } else if (!startElement.tableId && cacheStartElement.tableId) {
        // &&
        if (startPosition.index < positionContextIndex) {
          positionContextIndex += replaceLength;
        }
      }
      position.setPositionContext({
        ...positionContext,
        index: positionContextIndex,
      });
    }
    const rangeStartIndex = getElementIndexByDragId(rangeStartId, elementList);
    const rangeEndIndex = getElementIndexByDragId(rangeEndId, elementList);
    rangeManager.setRange(
      rangeStartIndex,
      rangeEndIndex,
      range.tableId,
      range.startTdIndex,
      range.endTdIndex,
      range.startTrIndex,
      range.endTrIndex
    );
    draw.render({
      isSetCursor: false,
    });
  } else if (host.isAllowDrag) {
    host.mousedown(evt);
  }
}
