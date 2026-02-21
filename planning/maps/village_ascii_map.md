# Village ASCII Map

Source: `cotwelm/src/ASCIIMaps.elm` — `villageMap`

## Correct Tile Mapping (from cotwelm Tile.elm)
Based on cotwelm's ASCII to TileType mapping:
- `!` (frame 29) — Signpost
- `,` (frame 0) — Grass
- `#` (frame 3) — Wall (building blocks)
- `.` (frame 2) — Stone Path (roads) — **rotates based on neighbors**
- `=` (frame 19) — Crop (borders/mountains in village map) — **rotates based on neighbors**
- `;` (frame 5) — Fence/hedge
- `e` (frame 6) — Stairs (well entrance)
- `^` (frame 7) — Mountain/Rock — **rotates based on neighbors**

## Tile Orientation System
Tiles rotate based on **cardinal neighbors** (N, S, E, W) matching the same tile type:
- **Oriented Tiles**: Stone Path (`.`), Mountain/Crop (`=`, `^`)
- **Rotation Logic**:
  - 0° (default): Down-Left corner
  - 90°: Up-Left corner (or horizontal)
  - 180°: Up-Right corner
  - 270° (-90°): Down-Right corner

## Neighbor Checking
For each tile, check if adjacent tiles are the same type:
- If matching neighbors form a corner pattern, rotate accordingly
- Diagonal tiles will align properly with corner rotations
- Matches cotwelm's "half-tile" rotation system

## Map (rows top→bottom, y=27 at top, y=0 at bottom)

```
========,,###,,,========
========,,,.,,,,========
========,,,.,,,,========
========,,,.,,,,========
========,,,.,,,,========
===,,,,,;...,,,!###=====
===###!;.;,.,,;.###=====
===###..;,,.,;.;###=====
===###,,,,,...;,,,,,,===
===,,,,,,,,.,,,,,,,,,===
====,,,,,,,.,,,,,,,,,===
====,,,,,,,.,,,,,,,,,===
====,,,,,,,.,!###,,,,===
====,,,##.....###,,,,===
====,,,##!,.,,###,,,,===
====,,,,,,,.,,,,,,,,,===
====,,,,,,,.,,,,,,,,,===
====,,###!...!###,======
====,,###..e..###,======
====,,###,...,###,======
====,,,,,,,.,,,,,,======
====,,,,,,,.!,,,,,======
======,,,#####,=========
======,,,#####,=========
======,,,#####,=========
======,,,#####,=========
======,,,#####,=========
========================
```

## Buildings (from ASCIIMaps.elm)
| Position | Description |
|---|---|
| (12, 21) | Temple of Odin: healer of ailments |
| (9, 17) | Weaponsmith |
| (13, 17) | General store |
| (9, 14) | Kael's scrolls & identification |
| (13, 12) | Barg's house, private property |
| (6, 6) | Junk yard |
| (15, 5) | Another house |
