# Seikret Sauce

Domain language for the Monster Hunter Wilds loadout optimizer: the frontend collects a player's
desired skills and asks the backend search engine for ranked armor builds that achieve them.

## Language

**Regular Skill**:
A skill granted by armor pieces or decorations, requested as a target level (`skills` in the request).
_Avoid_: normal skill

**Set Skill**:
A skill that activates only when enough pieces of the same armor set are equipped; requested as a
required activation level, not a piece count.
_Avoid_: armor-set bonus

**Group Skill**:
Like a Set Skill but tied to a "group" of armor rather than a named set; activation level is usually 1.

**Activation Level**:
How many times a Set/Group Skill must trigger (the value sent in `setSkills`/`groupSkills` and
echoed back as `setSkills`/`groupSkills` in a result).
_Avoid_: piece count

**Pre-owned Piece Count**:
How many pieces toward a Set/Group Skill the player already has *before* the armor search runs —
chiefly an **equipped weapon** that carries that skill ("weapon contributes 1"). Sent as
`initialSetCounts`/`initialGroupCounts`. Distinct from Activation Level.
_Avoid_: initial count (use the full term to keep it separate from Activation Level)

**Build / Loadout Result**:
One ranked search result: six armor slots (head, chest, arms, waist, legs, talisman), the
decorations slotted, achieved skills, free/total decoration slots, base defense and elemental
defenses.
_Avoid_: set (ambiguous with Set Skill)

**Talisman**:
The sixth and final armor slot. Always has rarity `0` and is excluded from `defense`/`elementalDefenses`,
which cover the five body pieces only.

**Weapon**:
A catalog item of one of 14 weapon types, served by `/api/mh-wilds/weapons` and picked in the Build Editor
by type first, then by item (grouped by rarity). Carries base raw (and in-game display) damage, affinity,
element/status specials, sharpness (melee only), weapon-type decoration slots, ordinary weapon skills, and
type-specific data. Distinct from the **weapon bonus** pair below (backend ADR-0013).

**Working Build**:
The unsaved Build Editor draft. A new build's draft is persisted to localStorage (`working-build.ts`) so picks
such as the **Weapon** survive a reload; it is sent to the API only when the hunter saves. The
chosen **Weapon** and the jewels seated in its slots are part of the saved Build and count toward the calculated
totals; a Saved Build from before weapons were catalog items carries only the bonus pair and still renders.

**Skill Catalog**:
The shared reference data returned by `/api/mh-wilds/skills`, containing Regular Skill definitions
and Set/Group Skill definitions. Frontend features consume derived category groups and lookup indexes
from one catalog rather than fetching or reclassifying the same definitions independently.

## Relationships

- A **Build** satisfies a set of requested **Regular Skills**, **Set Skills**, and **Group Skills**.
- The **Skill Catalog** is the frontend authority for skill names, levels, categories, icons, and
  Set/Group Skill thresholds.
- A **Set Skill**'s **Activation Level** is reached by combining armor pieces with any
  **Pre-owned Piece Count** the player brings in (e.g. an equipped weapon).
- **Pre-owned Piece Count** originates from the optimizer's weapon-bonus picker (a Set and/or Group Skill the
  equipped weapon carries). The Build Editor now also picks a catalog **Weapon**, but the optimizer does not
  read it yet, so `initialSetCounts`/`initialGroupCounts` still come from the bonus picker alone.
- In the Build Editor the **Weapon** (type, then item) and the weapon Set/Group Bonus pair are separate rows;
  picking a **Weapon** does not change the bonus pair.

## Example dialogue

> **Dev:** "If I want Gore Magala's Tyranny at activation 1 and my weapon already gives one piece,
> do I send `setSkills` *and* `initialSetCounts`?"
> **Domain expert:** "Yes — `setSkills` is the activation you want; `initialSetCounts` is the head
> start your weapon gives. They're different axes. Until there's a weapon picker, send only
> `setSkills` and leave the engine to find all the pieces in armor."

## Flagged ambiguities

- `initialSetCounts` was originally populated by copying the desired `setSkills` levels — conflating
  **Activation Level** with **Pre-owned Piece Count**. Resolved: these are distinct; initial counts
  come from an equipped weapon and are omitted until weapon selection exists.
- "set" was used for both **Set Skill** and a search result — prefer **Build** for the result.
