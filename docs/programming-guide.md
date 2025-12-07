# ParcTalk Programming Guide

ParcTalk is the scripting language for parcOS, designed to control the cognitive user interface, manage card layouts, and interact with BILL (the AI assistant). This guide covers the complete syntax, available APIs, and best practices for building apps in parcOS.

## Table of Contents

1. [Language Basics](#language-basics)
2. [Cards and UI](#cards-and-ui)
3. [CMFK Cognitive System](#cmfk-cognitive-system)
4. [BILL Integration](#bill-integration)
5. [Window and Dock Controls](#window-and-dock-controls)
6. [Complete API Reference](#complete-api-reference)
7. [Examples](#examples)

---

## Language Basics

### Syntax Overview

ParcTalk uses a clean, readable syntax inspired by natural language commands:

```parctalk
// Comments use double-slash
/* Block comments work too */

// Basic command structure
target.action(arguments);

// Card definition
card "CardName" {
  // commands inside card
}
```

### Data Types

- **Strings**: `"hello"` or `'world'`
- **Numbers**: `42`, `3.14`
- **Booleans**: `true`, `false`
- **Objects**: `{ key: value, other: 123 }`
- **Arrays**: `["item1", "item2", 42]`
- **Null**: `null`

### Keywords

Reserved keywords in ParcTalk:
- Flow control: `if`, `else`, `while`, `for`, `return`
- Cards: `card`, `open`, `close`, `animate`
- UI: `window`, `dock`, `spatial`, `move`, `resize`
- Cognitive: `fog`, `meaning`, `cmfk`
- System: `set`, `get`, `flow`, `collapse`, `highlight`, `bill`

### Operators

```parctalk
// Comparison
==, !=, <, >, <=, >=

// Arithmetic
+, -, *, /, %

// Logical
&&, ||, !

// Assignment
=

// Member access
.

// Arrow (for lambdas)
=>
```

---

## Cards and UI

### Creating Cards

Cards are the primary UI containers in parcOS:

```parctalk
card "Sports" {
  open();
  animate pulse;
}

card "Classroom" {
  open();
  fog.collapse();
}
```

### Opening and Closing Cards

```parctalk
// Open a card
open("Sports");

// Close a card
close("Classroom");

// Open with card definition
card "MyApp" {
  open();
}
```

### Card Animations

Available animations:
- `pulse` - Gentle pulsing effect
- `bounce` - Bouncing animation
- `focus` - Focus attention
- `pin` / `unpin` - Pin card to position
- `glow` - Glowing highlight

```parctalk
animate pulse;
animate bounce { duration: 500 };
```

### Card Positioning and Sizing

```parctalk
// Move a card
card.move(100, 200);
card.move({ x: 100, y: 200 });

// Resize a card
card.resize(400, 300);
card.resize({ width: 400, height: 300 });

// Pin/unpin
card.pin();
card.unpin();
```

---

## CMFK Cognitive System

CMFK (Correctness, Misconception, Fog, Knowingness) is the cognitive state vector that tracks user understanding.

### CMFK Components

| Component | Range | Description |
|-----------|-------|-------------|
| Correctness | 0-1 | How correct the user's understanding is |
| Misconception | 0-1 | Level of misconceptions |
| Fog | 0-1 | Mental fog/confusion level |
| Knowingness | 0-1 | Confidence in knowledge |

### Fog Operations

```parctalk
// Collapse fog (reduce confusion, increase clarity)
fog.collapse("CardName");
fog.collapse();  // Current card

// Manually adjust fog
fog.increase(0.2);
fog.decrease(0.1);

// Get current fog level
fog.get();
```

### Meaning Flow

```parctalk
// Flow meaning between concepts
meaning.flow("source.destination");

// Connect meaning nodes
meaning.connect("concept1", "concept2", "concept3");

// Extract meaning summary
meaning.extract("topic");
```

### CMFK Direct Access

```parctalk
// Get entire CMFK vector
cmfk.get();

// Set CMFK components
cmfk.set({ fog: 0.3, knowingness: 0.8 });

// Update based on events
cmfk.update("success", 0.8);
cmfk.update("view", 0.5);

// Get priority score
cmfk.priority();

// Get human-readable summary
cmfk.summary();
```

### CMFK Event Types

When calling `cmfk.update(eventType, magnitude)`:
- `success` - User succeeded at a task
- `failure` - User made an error
- `view` - User viewed content
- `progress` - Forward progress made
- `confusion` - User showed confusion

---

## BILL Integration

BILL is the AI assistant in parcOS. ParcTalk provides direct bindings to BILL commands.

### Speaking

```parctalk
// BILL says something
bill.say("Hello, welcome to parcOS!");
bill.speak("Let me help you with that.");
```

### Commands

```parctalk
// Run a BILL command
bill.command("analyze momentum");
bill.run("show highlights");
```

### Suggestions

```parctalk
// Get contextual suggestions based on CMFK
bill.suggest();  // Returns array of suggestions
```

### Help System

```parctalk
// Get help on topics
bill.help();           // General help
bill.help("launch");   // Help on launching apps
bill.help("cmfk");     // Help on CMFK system
bill.help("parctalk"); // Help on ParcTalk language
```

### App Launching

```parctalk
// Launch apps by name
bill.launch("Sports");
bill.launch("NIL");
bill.launch("Classroom");
```

### Workspace Arrangement

```parctalk
// Arrange cards in different layouts
bill.arrange("grid");     // Grid layout
bill.arrange("cascade");  // Cascading windows
bill.arrange("stack");    // Stacked cards
bill.arrange("tile");     // Tiled layout
```

### BILL Visibility

```parctalk
bill.open();    // Open BILL panel
bill.close();   // Close BILL panel
bill.toggle();  // Toggle visibility
```

### Analysis

```parctalk
// Analyze a target with current context
bill.analyze("Sports");
```

---

## Window and Dock Controls

### Window Management

```parctalk
// Move a window
window("Sports").move({ x: 100, y: 50 });

// Resize a window
window("Sports").resize({ width: 600, height: 400 });

// Focus a window
window("Sports").focus();

// Minimize/maximize
window("Sports").minimize();
window("Sports").maximize();

// Close window
window("Sports").close();
```

### Dock Controls

```parctalk
// Highlight app in dock
dock("Sports").highlight();
dock("Sports").unhighlight();

// Bounce effect
dock("Sports").bounce();

// Add badge count
dock("Sports").badge(5);
```

### Spatial Mode

```parctalk
// Enable/disable spatial layout
set.spatial("on");
set.spatial("off");
set.spatial(true);
set.spatial(false);
```

### System Settings

```parctalk
// Switch workspace
set.workspace("Main");

// Change theme
set.theme("dark");
set.theme("light");

// Focus a card
set.focus("Sports");
```

### Opening Items

```parctalk
// Open a card
open.card("Sports");

// Open a URL in browser
open.browser("https://example.com");

// Open BILL
open.bill();
```

---

## Complete API Reference

### Card Commands

| Command | Description | Example |
|---------|-------------|---------|
| `open(name)` | Opens a card | `open("Sports")` |
| `close(name)` | Closes a card | `close("Sports")` |
| `card.move(x, y)` | Moves current card | `card.move(100, 200)` |
| `card.resize(w, h)` | Resizes current card | `card.resize(400, 300)` |
| `card.animate(type)` | Animates card | `card.animate("pulse")` |
| `card.pin()` | Pins card position | `card.pin()` |
| `card.unpin()` | Unpins card | `card.unpin()` |

### Fog Commands

| Command | Description | Example |
|---------|-------------|---------|
| `fog.collapse(card?)` | Reduces fog | `fog.collapse()` |
| `fog.increase(amount)` | Increases fog | `fog.increase(0.2)` |
| `fog.decrease(amount)` | Decreases fog | `fog.decrease(0.1)` |
| `fog.get()` | Gets fog level | `fog.get()` |

### Meaning Commands

| Command | Description | Example |
|---------|-------------|---------|
| `meaning.flow(path)` | Flows meaning | `meaning.flow("A.B")` |
| `meaning.connect(...nodes)` | Connects nodes | `meaning.connect("a", "b")` |
| `meaning.extract(target)` | Extracts summary | `meaning.extract("topic")` |

### CMFK Commands

| Command | Description | Example |
|---------|-------------|---------|
| `cmfk.get()` | Gets CMFK vector | `cmfk.get()` |
| `cmfk.set(values)` | Sets CMFK values | `cmfk.set({ fog: 0.3 })` |
| `cmfk.update(type, mag)` | Updates from event | `cmfk.update("success", 0.8)` |
| `cmfk.priority()` | Gets priority score | `cmfk.priority()` |
| `cmfk.summary()` | Gets text summary | `cmfk.summary()` |

### BILL Commands

| Command | Description | Example |
|---------|-------------|---------|
| `bill.say(text)` | BILL speaks | `bill.say("Hello!")` |
| `bill.command(cmd)` | Runs command | `bill.command("analyze")` |
| `bill.suggest()` | Gets suggestions | `bill.suggest()` |
| `bill.help(topic?)` | Gets help | `bill.help("cmfk")` |
| `bill.launch(app)` | Launches app | `bill.launch("Sports")` |
| `bill.arrange(layout)` | Arranges cards | `bill.arrange("grid")` |
| `bill.open()` | Opens BILL | `bill.open()` |
| `bill.close()` | Closes BILL | `bill.close()` |
| `bill.toggle()` | Toggles BILL | `bill.toggle()` |
| `bill.analyze(target)` | Analyzes target | `bill.analyze("Sports")` |

### Window Commands

| Command | Description | Example |
|---------|-------------|---------|
| `window(name).move(pos)` | Moves window | `window("App").move({x:0,y:0})` |
| `window(name).resize(size)` | Resizes window | `window("App").resize({width:500})` |
| `window(name).focus()` | Focuses window | `window("App").focus()` |
| `window(name).minimize()` | Minimizes | `window("App").minimize()` |
| `window(name).maximize()` | Maximizes | `window("App").maximize()` |
| `window(name).close()` | Closes window | `window("App").close()` |

### Dock Commands

| Command | Description | Example |
|---------|-------------|---------|
| `dock(app).highlight()` | Highlights app | `dock("Sports").highlight()` |
| `dock(app).unhighlight()` | Removes highlight | `dock("Sports").unhighlight()` |
| `dock(app).bounce()` | Bounces icon | `dock("Sports").bounce()` |
| `dock(app).badge(n)` | Sets badge | `dock("Sports").badge(3)` |

### Set Commands

| Command | Description | Example |
|---------|-------------|---------|
| `set.spatial(on/off)` | Toggles spatial | `set.spatial("on")` |
| `set.workspace(name)` | Switches workspace | `set.workspace("Main")` |
| `set.theme(name)` | Changes theme | `set.theme("dark")` |
| `set.focus(card)` | Focuses card | `set.focus("Sports")` |

### Open Commands

| Command | Description | Example |
|---------|-------------|---------|
| `open.card(name)` | Opens card | `open.card("Sports")` |
| `open.browser(url)` | Opens browser | `open.browser("https://...")` |
| `open.bill()` | Opens BILL | `open.bill()` |

---

## Examples

### Example 1: Sports Dashboard Setup

```parctalk
// Set up sports workspace
card "Sports" {
  open();
  animate pulse;
  fog.collapse();
}

bill.say("Sports dashboard ready");
bill.arrange("grid");
set.spatial("on");
```

### Example 2: Learning Session

```parctalk
// Start a learning session
open("Classroom");
cmfk.set({ fog: 0.8, knowingness: 0.2 });

// As user progresses
meaning.flow("concepts.understanding");
fog.decrease(0.2);

// On success
cmfk.update("success", 0.9);
bill.say("Great job! Fog has cleared.");
```

### Example 3: Multi-Card Workflow

```parctalk
// Open multiple cards
bill.launch("Sports");
bill.launch("NIL");

// Arrange in cascade
bill.arrange("cascade");

// Highlight active
dock("Sports").highlight();

// Move to specific position
window("Sports").move({ x: 50, y: 50 });
window("NIL").move({ x: 100, y: 100 });
```

### Example 4: CMFK-Driven Adaptation

```parctalk
// Check user state
cmfk.get();

// Get contextual suggestions
bill.suggest();

// If fog is high, offer help
fog.collapse();
bill.help("parctalk");

// Analyze current context
bill.analyze("current_state");
```

### Example 5: Full App Card

```parctalk
card "MyApp" {
  open();
  animate bounce;
  
  // Set up cognitive tracking
  fog.collapse();
  meaning.flow("intro.core");
  
  // Position window
  window("MyApp").move({ x: 200, y: 100 });
  window("MyApp").resize({ width: 600, height: 400 });
  
  // Dock indicator
  dock("MyApp").highlight();
  dock("MyApp").badge(1);
}

// BILL announcement
bill.say("MyApp is now running!");
```

---

## Sandbox Mode

ParcTalk runs in sandbox mode by default, preventing destructive operations:

**Blocked actions in sandbox:**
- `delete`
- `remove`
- `clear`
- `reset`
- `destroy`
- `drop`

To run unrestricted (use with caution):
```typescript
import { runScriptUnsafe } from './language';
runScriptUnsafe(script, context);
```

---

## Error Handling

ParcTalk returns structured results:

```typescript
interface ExecutionResult {
  success: boolean;
  value?: any;
  error?: string;
  sideEffects: SideEffect[];
}
```

Side effects describe UI changes to be applied:
- `card_open` / `card_close`
- `card_move` / `card_resize` / `card_animate`
- `window_move` / `window_resize`
- `dock_highlight`
- `spatial_toggle`
- `cmfk_update`
- `bill_command`
- `log`

---

## Best Practices

1. **Collapse fog early** - Call `fog.collapse()` when users gain understanding
2. **Use meaning flow** - Track how concepts connect with `meaning.flow()`
3. **Leverage BILL** - Use `bill.suggest()` for contextual recommendations
4. **Animate thoughtfully** - Use animations to draw attention, not distract
5. **Group related cards** - Use workspace arrangements for organization
6. **Update CMFK on events** - Keep cognitive state current with `cmfk.update()`

---

## Integration with React

```typescript
import { runScript, createRuntime } from '@/language';
import { useOSStore } from '@/state/store';

// Run a script
const result = runScript(`
  open("Sports");
  fog.collapse();
`);

// Apply side effects to store
if (result.success) {
  result.sideEffects.forEach(effect => {
    // Handle each effect type
    switch (effect.type) {
      case 'card_open':
        useOSStore.getState().openCard(effect.target);
        break;
      // ... other cases
    }
  });
}
```

---

*ParcTalk v1.0 - The cognitive scripting language for parcOS*
