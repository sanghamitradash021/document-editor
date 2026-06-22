export enum ListType {
  UL = 'ul',
  OL = 'ol',
}

export enum UlStyle {
  DISC = 'disc', //
  CIRCLE = 'circle', //
  SQUARE = 'square', //
}

export enum OlStyle {
  DECIMAL = 'decimal', //
}

export enum ListStyle {
  DISC = UlStyle.DISC,
  CIRCLE = UlStyle.CIRCLE,
  SQUARE = UlStyle.SQUARE,
  DECIMAL = OlStyle.DECIMAL,
}
