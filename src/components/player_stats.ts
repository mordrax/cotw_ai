import { Types, defineComponent } from "bitecs";

export const PlayerStats = defineComponent({
  str: Types.ui8,
  int: Types.ui8,
  con: Types.ui8,
  dex: Types.ui8,
  level: Types.ui8,
  xp: Types.ui32,
  maxHp: Types.ui16,
  maxMana: Types.ui16,
});
