import { EditorComponent, EDITOR_COMPONENT } from '../../editor';
import '../signature/signature.css';

export interface IRangePickerResult {
  value: number;
}

export interface IRangePickerOptions {
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm?: (payload: IRangePickerResult | null) => void;
}

export class RangePicker {
  private options: IRangePickerOptions;
  private mask: HTMLDivElement;
  private container: HTMLDivElement;

  constructor(options: IRangePickerOptions) {
    this.options = options;
    const { mask, container } = this._render();
    this.mask = mask;
    this.container = container;
  }

  private _dispose() {
    this.mask.remove();
    this.container.remove();
  }
}
