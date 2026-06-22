import { CanvasEvent } from '../CanvasEvent';

export function mouseleave(evt: MouseEvent, host: CanvasEvent) {
  // canvas
  const draw = host.getDraw();
  const pageContainer = draw.getPageContainer();
  const { x, y, width, height } = pageContainer.getBoundingClientRect();
  if (evt.x >= x && evt.x <= x + width && evt.y >= y && evt.y <= y + height) {
    return;
  }
  host.setIsAllowSelection(false);
}
