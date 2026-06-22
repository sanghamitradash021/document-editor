import { IRowElement } from '../../../interface/Row';
export class SeparatorParticle {
  public render(
    ctx: CanvasRenderingContext2D,
    element: IRowElement,
    x: number,
    y: number
  ) {
    ctx.save();
    if (element.color) {
      ctx.strokeStyle = element.color;
    }
    if (element.dashArray && element.dashArray.length) {
      ctx.setLineDash(element.dashArray);
    }
    ctx.translate(0, 0.5); // 1，3
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + element.width!, y);
    ctx.stroke();
    ctx.restore();
  }
}
