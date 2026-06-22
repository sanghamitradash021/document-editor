import { ElementType } from '../../../dataset/enum/Element';
import { MouseEventButton } from '../../../dataset/enum/Event';
import { deepClone } from '../../../utils';
import { isMod } from '../../../utils/hotkey';
import { CheckboxControl } from '../../draw/control/checkbox/CheckboxControl';
import { CanvasEvent } from '../CanvasEvent';

export function mousedown(evt: MouseEvent, host: CanvasEvent) {
  if (evt.button === MouseEventButton.RIGHT) return;
  const draw = host.getDraw();
  const isReadonly = draw.isReadonly();
  const rangeManager = draw.getRange();
  rangeManager.pendingStyle = null;
  const position = draw.getPosition();
  // Whether it is selection dragging
  if (!host.isAllowDrag) {
    const range = rangeManager.getRange();
    if (!isReadonly && range.startIndex !== range.endIndex) {
      const isPointInRange = rangeManager.getIsPointInRange(
        evt.offsetX,
        evt.offsetY
      );
      if (isPointInRange) {
        host.isAllowDrag = true;
        host.cacheRange = deepClone(range);
        host.cacheElementList = draw.getElementList();
        host.cachePositionList = position.getPositionList();
        return;
      }
    }
  }
  const target = evt.target as HTMLDivElement;
  const pageIndex = target.dataset.index;
  // set pageNo
  if (pageIndex) {
    draw.setPageNo(Number(pageIndex));
  }
  host.isAllowSelection = true;
  const positionResult = position.adjustPositionContext({
    x: evt.offsetX,
    y: evt.offsetY,
  });
  if (!positionResult) return;
  const {
    index,
    isDirectHit,
    isCheckbox,
    isImage,
    isTable,
    tdValueIndex,
    hitLineStartIndex,
  } = positionResult;
  host.mouseDownStartPosition = {
    ...positionResult,
    index: isTable ? tdValueIndex! : index,
  };
  const elementList = draw.getElementList();
  const positionList = position.getPositionList();
  const curIndex = isTable ? tdValueIndex! : index;
  const curElement = elementList[curIndex];
  const isDirectHitImage = !!(isDirectHit && isImage);
  const isDirectHitCheckbox = !!(isDirectHit && isCheckbox);
  if (~index) {
    rangeManager.setRange(curIndex, curIndex);
    position.setCursorPosition(positionList[curIndex]);
    const isSetCheckbox = isDirectHitCheckbox && !isReadonly;
    if (isSetCheckbox) {
      const { checkbox } = curElement;
      if (checkbox) {
        checkbox.value = !checkbox.value;
      } else {
        curElement.checkbox = {
          value: true,
        };
      }
      const control = draw.getControl();
      const activeControl = control.getActiveControl();
      if (activeControl instanceof CheckboxControl) {
        activeControl.setSelect();
      }
    }
    draw.render({
      curIndex,
      isSubmitHistory: isSetCheckbox,
      isSetCursor: !isDirectHitImage && !isDirectHitCheckbox,
      isCompute: false,
    });
    if (hitLineStartIndex) {
      host.getDraw().getCursor().drawCursor({
        hitLineStartIndex,
      });
    }
  }
  const previewer = draw.getPreviewer();
  previewer.clearResizer();
  if (isDirectHitImage && !isReadonly) {
    previewer.drawResizer(
      curElement,
      positionList[curIndex],
      curElement.type === ElementType.LATEX
        ? {
            mime: 'svg',
            srcKey: 'laTexSVG',
          }
        : {}
    );
    draw.getCursor().drawCursor({
      isShow: false,
    });
  }
  const tableTool = draw.getTableTool();
  tableTool.dispose();
  if (isTable && !isReadonly) {
    tableTool.render();
  }
  const hyperlinkParticle = draw.getHyperlinkParticle();
  hyperlinkParticle.clearHyperlinkPopup();
  if (curElement.type === ElementType.HYPERLINK) {
    if (isMod(evt)) {
      hyperlinkParticle.openHyperlink(curElement);
    } else {
      hyperlinkParticle.drawHyperlinkPopup(curElement, positionList[curIndex]);
    }
  }
  const dateParticle = draw.getDateParticle();
  dateParticle.clearDatePicker();
  if (curElement.type === ElementType.DATE && !isReadonly) {
    dateParticle.renderDatePicker(curElement, positionList[curIndex]);
  }
}
