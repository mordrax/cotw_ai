import { Types, defineComponent } from "bitecs";

export const Input = defineComponent({
  dx: Types.i8,
  dy: Types.i8,
  isInteract: Types.ui8,
  isInventory: Types.ui8,
  isMagic: Types.ui8,
  isWait: Types.ui8,
});
