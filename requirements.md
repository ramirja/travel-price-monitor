# Travel Price Monitor - Requirements

## Project Goal

Automatically monitor the price of a specific Royal Caribbean cruise and notify me whenever the price changes.

---

## Version 1 Scope

Monitor a single cruise:

- Cruise Line: Royal Caribbean
- Ship: Odyssey of the Seas
- Sailing Date: June 20, 2027
- Departure Port: Rome (Civitavecchia)

---

## Functional Requirements

The system shall:

1. Check the cruise price automatically once every day.
2. Store the retrieved price.
3. Compare today's price with the previous recorded price.
4. Detect price increases and decreases.
5. Notify me only when the price changes.
6. Include the previous price, current price, and difference.
7. Keep a historical log of every daily check.

---

## Future Features (Out of Scope)

- Flight monitoring
- Hotel monitoring
- Excursion monitoring
- Currency exchange monitoring
- Dashboard
- AI booking recommendations

---

## Success Criteria

The workflow runs automatically every day and sends a notification only if the cruise price has changed.