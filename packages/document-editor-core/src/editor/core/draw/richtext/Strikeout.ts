import { AbstractRichText } from './AbstractRichText';
import { IEditorOption } from '../../../interface/Editor';
import { Draw } from '../Draw';

export class Strikeout extends AbstractRichText {
  private options: Required<IEditorOption>;

  constructor(draw: Draw) {
    super();
    this.options = draw.getOptions();
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (!this.fillRect.width) return;
    const { strikeoutColor } = this.options;
    const { x, y, width } = this.fillRect;
    ctx.save();
    ctx.strokeStyle = strikeoutColor;
    const adjustY = y + 0.5; // 1，3
    ctx.beginPath();
    ctx.moveTo(x, adjustY);
    ctx.lineTo(x + width, adjustY);
    ctx.stroke();
    ctx.restore();
    this.clearFillInfo();
  }
}
