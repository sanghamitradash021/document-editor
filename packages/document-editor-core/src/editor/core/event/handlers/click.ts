import { ZERO } from '../../../dataset/constant/Common';
import { LETTER_REG, NUMBER_LIKE_REG } from '../../../dataset/constant/Regular';
import { CanvasEvent } from '../CanvasEvent';

function dblclick(host: CanvasEvent, evt: MouseEvent) {
  const draw = host.getDraw();
  const position = draw.getPosition();
  if (draw.getIsPagingMode()) {
    const positionContext = position.getPositionByXY({
      x: evt.offsetX,
      y: evt.offsetY,
    });
    if (!~positionContext.index && positionContext.zone) {
      draw.getZone().setZone(positionContext.zone);
      return;
    }
  }
  const cursorPosition = position.getCursorPosition();
  if (!cursorPosition) return;
  const { value, index } = cursorPosition;
  let upCount = 0;
  let downCount = 0;
  const isNumber = NUMBER_LIKE_REG.test(value);
  if (isNumber || LETTER_REG.test(value)) {
    const elementList = draw.getElementList();
    let upStartIndex = index - 1;
    while (upStartIndex > 0) {
      const value = elementList[upStartIndex].value;
      if (
        (isNumber && NUMBER_LIKE_REG.test(value)) ||
        (!isNumber && LETTER_REG.test(value))
      ) {
        upCount++;
        upStartIndex--;
      } else {
        break;
      }
    }
    let downStartIndex = index + 1;
    while (downStartIndex < elementList.length) {
      const value = elementList[downStartIndex].value;
      if (
        (isNumber && NUMBER_LIKE_REG.test(value)) ||
        (!isNumber && LETTER_REG.test(value))
      ) {
        downCount++;
        downStartIndex++;
      } else {
        break;
      }
    }
  }
  const rangeManager = draw.getRange();
  rangeManager.setRange(index - upCount - 1, index + downCount);
  draw.render({
    isSubmitHistory: false,
    isSetCursor: false,
    isCompute: false,
  });
}

function threeClick(host: CanvasEvent) {
  const draw = host.getDraw();
  const position = draw.getPosition();
  const cursorPosition = position.getCursorPosition();
  if (!cursorPosition) return;
  const { index } = cursorPosition;
  const elementList = draw.getElementList();
  let upCount = 0;
  let downCount = 0;
  let upStartIndex = index - 1;
  while (upStartIndex > 0) {
    const value = elementList[upStartIndex].value;
    if (value !== ZERO) {
      upCount++;
      upStartIndex--;
    } else {
      break;
    }
  }
  let downStartIndex = index + 1;
  while (downStartIndex < elementList.length) {
    const value = elementList[downStartIndex].value;
    if (value !== ZERO) {
      downCount++;
      downStartIndex++;
    } else {
      break;
    }
  }
  const rangeManager = draw.getRange();
  rangeManager.setRange(index - upCount - 1, index + downCount);
  draw.render({
    isSubmitHistory: false,
    isSetCursor: false,
    isCompute: false,
  });
}

export default {
  dblclick,
  threeClick,
};
