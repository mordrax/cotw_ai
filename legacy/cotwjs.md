# cotwjs (2013) — First Rewrite

**Stack:** TypeScript + jQuery
**Repo:** mordrax/CoTWjs
**Deployment:** Google App Engine

## Architecture

MVC pattern with a Finite State Machine managing game states.

## What Was Built

- Graphics rendering engine
- Keyboard input handling
- Inventory management system
- Basic physics engine
- Shop system
- Dungeon generation

## Assets

Sprites ripped directly from the original Windows 3.1 game:

- `tiles.png` — Floor, wall, door, stairs, decoration tiles
- `monsters.png` — All monster sprites
- `items.png` — Equipment, consumables, gold, containers

## Why It Stopped

jQuery + HTML DOM architecture proved fundamentally unworkable for real-time game state management. DOM manipulation was too slow for responsive gameplay, and state became scattered across jQuery selectors with no centralized management.

## Key Lesson

A game needs a proper rendering pipeline and centralized state management. The DOM is not a game engine.
