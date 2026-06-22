import { EDITOR_ELEMENT_STYLE_ATTR } from '../../../../dataset/constant/Element';
import { ControlComponent } from '../../../../dataset/enum/Control';
import { KeyMap } from '../../../../dataset/enum/KeyMap';
import { IControlInstance } from '../../../../interface/Control';
import { IElement } from '../../../../interface/Element';
import { omitObject } from '../../../../utils';
import { formatElementContext } from '../../../../utils/element';
import { Control } from '../Control';

export class TextControl implements IControlInstance {
  private element: IElement;
  private control: Control;

  constructor(element: IElement, control: Control) {
    this.element = element;
    this.control = control;
  }

  public getElement(): IElement {
    return this.element;
  }

  public getValue(): IElement[] {
    const elementList = this.control.getElementList();
    const { startIndex } = this.control.getRange();
    const startElement = elementList[startIndex];
    const data: IElement[] = [];
    let preIndex = startIndex;
    while (preIndex > 0) {
      const preElement = elementList[preIndex];
      if (
        preElement.controlId !== startElement.controlId ||
        preElement.controlComponent === ControlComponent.PREFIX
      ) {
        break;
      }
      if (preElement.controlComponent === ControlComponent.VALUE) {
        data.unshift(preElement);
      }
      preIndex--;
    }
    let nextIndex = startIndex + 1;
    while (nextIndex < elementList.length) {
      const nextElement = elementList[nextIndex];
      if (
        nextElement.controlId !== startElement.controlId ||
        nextElement.controlComponent === ControlComponent.POSTFIX
      ) {
        break;
      }
      if (nextElement.controlComponent === ControlComponent.VALUE) {
        data.push(nextElement);
      }
      nextIndex++;
    }
    return data;
  }

  public setValue(data: IElement[]): number {
    const elementList = this.control.getElementList();
    const range = this.control.getRange();
    // Value
    this.control.shrinkBoundary();
    const { startIndex, endIndex } = range;
    const draw = this.control.getDraw();
    if (startIndex !== endIndex) {
      draw.spliceElementList(
        elementList,
        startIndex + 1,
        endIndex - startIndex
      );
    } else {
      this.control.removePlaceholder(startIndex);
    }
    const startElement = elementList[startIndex];
    const anchorElement =
      startElement.controlComponent === ControlComponent.PREFIX
        ? omitObject(startElement, EDITOR_ELEMENT_STYLE_ATTR)
        : startElement;
    const start = range.startIndex + 1;
    for (let i = 0; i < data.length; i++) {
      const newElement: IElement = {
        ...anchorElement,
        ...data[i],
        controlComponent: ControlComponent.VALUE,
      };
      formatElementContext(elementList, [newElement], startIndex);
      draw.spliceElementList(elementList, start + i, 0, newElement);
    }
    return start + data.length - 1;
  }

  public keydown(evt: KeyboardEvent): number {
    const elementList = this.control.getElementList();
    const range = this.control.getRange();
    // Value
    this.control.shrinkBoundary();
    const { startIndex, endIndex } = range;
    const startElement = elementList[startIndex];
    const endElement = elementList[endIndex];
    const draw = this.control.getDraw();
    // backspace
    if (evt.key === KeyMap.Backspace) {
      if (startIndex !== endIndex) {
        draw.spliceElementList(
          elementList,
          startIndex + 1,
          endIndex - startIndex
        );
        const value = this.getValue();
        if (!value.length) {
          this.control.addPlaceholder(startIndex);
        }
        return startIndex;
      } else {
        if (
          startElement.controlComponent === ControlComponent.PREFIX ||
          endElement.controlComponent === ControlComponent.POSTFIX ||
          startElement.controlComponent === ControlComponent.PLACEHOLDER
        ) {
          return this.control.removeControl(startIndex);
        } else {
          draw.spliceElementList(elementList, startIndex, 1);
          const value = this.getValue();
          if (!value.length) {
            this.control.addPlaceholder(startIndex - 1);
          }
          return startIndex - 1;
        }
      }
    } else if (evt.key === KeyMap.Delete) {
      if (startIndex !== endIndex) {
        draw.spliceElementList(
          elementList,
          startIndex + 1,
          endIndex - startIndex
        );
        const value = this.getValue();
        if (!value.length) {
          this.control.addPlaceholder(startIndex);
        }
        return startIndex;
      } else {
        const endNextElement = elementList[endIndex + 1];
        if (
          (startElement.controlComponent === ControlComponent.PREFIX &&
            endNextElement.controlComponent === ControlComponent.PLACEHOLDER) ||
          endNextElement.controlComponent === ControlComponent.POSTFIX ||
          startElement.controlComponent === ControlComponent.PLACEHOLDER
        ) {
          return this.control.removeControl(startIndex);
        } else {
          draw.spliceElementList(elementList, startIndex + 1, 1);
          const value = this.getValue();
          if (!value.length) {
            this.control.addPlaceholder(startIndex);
          }
          return startIndex;
        }
      }
    }
    return endIndex;
  }

  public cut(): number {
    this.control.shrinkBoundary();
    const { startIndex, endIndex } = this.control.getRange();
    if (startIndex === endIndex) {
      return startIndex;
    }
    const draw = this.control.getDraw();
    const elementList = this.control.getElementList();
    draw.spliceElementList(elementList, startIndex + 1, endIndex - startIndex);
    const value = this.getValue();
    if (!value.length) {
      this.control.addPlaceholder(startIndex);
    }
    return startIndex;
  }
}
