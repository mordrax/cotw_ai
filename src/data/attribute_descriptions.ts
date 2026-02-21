/** Humorous descriptions per attribute at each threshold (ported from cotwelm). */

type DescriptionEntry = readonly [number, string];

const strengthDescriptions: readonly DescriptionEntry[] = [
  [10, "Unable to push open a door whose hinges were just serviced with WD40."],
  [20, "Stunted by a career in software engineering. The mind is strong but muscle atrophy is high."],
  [30, "Can carry groceries in one trip, but only just."],
  [40, "Reasonably fit. Could probably win an arm wrestle against your grandmother."],
  [50, "Of average strength!"],
  [60, "Likes to gym during lunch."],
  [70, "Intimidating handshake. People wince."],
  [80, "Can bend iron bars with moderate effort."],
  [90, "Boulders tremble at your approach."],
  [100, "Hammers are for wimps! You hit with your FISTS!"],
];

const intelligenceDescriptions: readonly DescriptionEntry[] = [
  [10, "Struggles to count past ten without removing shoes."],
  [20, "Can read, but moves lips while doing so."],
  [30, "Occasionally wins at tic-tac-toe."],
  [40, "Smart enough to know you're not that smart."],
  [50, "Smart enough to be at the peak of the bell curve."],
  [60, "Enjoys a good crossword. Finishes most of them."],
  [70, "Could probably teach at a university. Probably."],
  [80, "Memorises spell incantations on the first read."],
  [90, "Thinks in three languages simultaneously."],
  [100, "Can solve differential equations while dungeon crawling."],
];

const constitutionDescriptions: readonly DescriptionEntry[] = [
  [10, "Having a BAD day, every day. Like you've got two kids waking you up at night, EVERY night!"],
  [20, "Gets winded walking up a gentle slope."],
  [30, "Can jog for about five minutes before collapsing."],
  [40, "Survives flu season. Usually."],
  [50, "Able to outrun a hungry hippo!"],
  [60, "Can take a punch and keep going."],
  [70, "Runs marathons for fun. Sick sense of fun."],
  [80, "Shrugs off wounds that would fell a lesser adventurer."],
  [90, "Has been struck by lightning twice. Barely noticed."],
  [100, "Immortal? No. But close enough to make death nervous."],
];

const dexterityDescriptions: readonly DescriptionEntry[] = [
  [10, "Trips over flat surfaces. Regularly."],
  [20, "Can catch a ball, but only if thrown very slowly and directly at your hands."],
  [30, "Decent hand-eye coordination when sober."],
  [40, "Can thread a needle on the third attempt."],
  [50, "Average reflexes. Catches falling mugs about half the time."],
  [60, "Quick hands. Good at card tricks."],
  [70, "Can dodge a thrown tomato with style."],
  [80, "Juggles flaming swords as a party trick."],
  [90, "Arrows seem to curve around you out of respect."],
  [100, "Moves so fast you leave afterimages."],
];

const allDescriptions: Record<string, readonly DescriptionEntry[]> = {
  str: strengthDescriptions,
  int: intelligenceDescriptions,
  con: constitutionDescriptions,
  dex: dexterityDescriptions,
};

export function getAttributeDescription(attr: "str" | "int" | "con" | "dex", value: number): string {
  const entries = allDescriptions[attr];
  for (const [threshold, desc] of entries) {
    if (value < threshold) return desc;
  }
  return entries[entries.length - 1][1];
}
