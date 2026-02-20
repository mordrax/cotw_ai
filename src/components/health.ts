import { Types, defineComponent } from "bitecs";

export const Health = defineComponent({
  current: Types.ui16,
  max: Types.ui16,
});
