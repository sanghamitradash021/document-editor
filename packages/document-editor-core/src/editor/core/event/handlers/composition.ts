import { CanvasEvent } from '../CanvasEvent';
import { input, removeComposingInput } from './input';

function compositionstart(host: CanvasEvent) {
  host.isComposing = true;
}

function compositionend(host: CanvasEvent, evt: CompositionEvent) {
  host.isComposing = false;
  // Handle input box closing
  const draw = host.getDraw();
  // Nonexistent value: remove synthetic input
  if (!evt.data) {
    removeComposingInput(host);
    const rangeManager = draw.getRange();
    const { endIndex: curIndex } = rangeManager.getRange();
    draw.render({
      curIndex,
      isSubmitHistory: false,
    });
  } else {
    // ：input
    setTimeout(() => {
      if (host.compositionInfo) {
        input(evt.data, host);
      }
    });
  }
  const cursor = draw.getCursor();
  cursor.clearAgentDomValue();
}

export default {
  compositionstart,
  compositionend,
};
