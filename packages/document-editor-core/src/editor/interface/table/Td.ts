import { VerticalAlign } from '../../dataset/enum/VerticalAlign';
import { IElement, IElementPosition } from '../Element';
import { IRow } from '../Row';

export interface ITd {
  id?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  colspan: number;
  rowspan: number;
  value: IElement[];
  isLastRowTd?: boolean;
  isLastColTd?: boolean;
  isLastTd?: boolean;
  rowIndex?: number;
  colIndex?: number;
  rowList?: IRow[];
  positionList?: IElementPosition[];
  verticalAlign?: VerticalAlign;
  backgroundColor?: string;
  mainHeight?: number; // +
  realHeight?: number; // （）
  realMinHeight?: number; // （）
  borderBgTop?: string;
  borderBgBottom?: string;
  borderBgRight?: string;
  borderBgLeft?: string;
  borderWidthTop?: number;
  borderWidthBottom?: number;
  borderWidthLeft?: number;
  borderWidthRight?: number;
  isPageBreakBorderTop?: boolean;
  isPageBreakBorderBottom?: boolean;
  _pageBreakStampedTop?: boolean; // Draw.ts overwrote borderBgTop from #ffffff
  _pageBreakStampedBottom?: boolean; // Draw.ts overwrote borderBgBottom from #ffffff
}
