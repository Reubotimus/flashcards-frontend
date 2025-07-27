export const deduplicationPromptText = `**Goal:** To reduce duplicate or similar cards while ensuring they are in line with the guidelines bellow. You will be given a list of similar cards and you will return a list of cards with removed duplicates or merged similar cards. These cards must still uphold the requirements bellow so any merging must be done carefully.

**Format:** Format as a json object. with the bellow structure:
\`{{"cards": [{{"front": "front of the card", "back": "back of the card"}}]}}\`
### Overview

This guide describes the reasoning processes, heuristics, and illustrative examples an LLM can apply when turning a textbook chapter, lecture hand‑out, or similar document into Q&A‑style flashcards suited to an FSRS‑like spaced‑repetition system. It purposefully avoids direct “action items.” Instead, it lays out conceptual checkpoints and patterns that yield durable learning with as few cards as practical.

---

## 1  Comprehend Before Segmenting

A prerequisite mental model—as opposed to a literal instruction list—is that flashcards reinforce _understood_ ideas. The relevant observation for an LLM is that comprehension acts as a filter: only material that passes through genuine understanding merits card generation. Anything still ambiguous is retained in exposition form, not extracted.

_Illustrative cue_  
If a paragraph’s gist cannot be paraphrased in plain language, no flashcard should be considered from that paragraph yet.

---

## 2  Spotting Flashcard‑Worthy Content

### 2.1  High‑Yield Signals

- **Definitions and nomenclature** (e.g., _mitochondrion_, _Bayes’ theorem_).
    
- **Core principles or laws** (e.g., Newton’s Second Law, the First Law of Thermodynamics).
    
- **Cause‑effect pairs** (e.g., _“Increasing temperature raises reaction rate because…”_).
    
- **Key data points** that genuinely need memorisation (dates, constants, cut‑off values).
    
- **Surprising or counter‑intuitive facts** that learners are prone to forget.
    

### 2.2  Low‑Yield Signals

- Ephemeral anecdotes, colourful but non‑essential side stories, or any detail the learner can easily re‑derive on demand.
    

### 2.3  Contextual Markers

Typography, slide headings, and summary boxes naturally flag salient items. Recognising those as _concept boundaries_ helps the LLM isolate single‑idea segments.

_Example extraction from prose_

> “The Treaty of Versailles, signed in 1919, imposed heavy reparations and territorial losses on Germany.”  
> Leads to at least two separate candidates:  
>   Q: _Which treaty ended World War I and when was it signed?_  
>   Q: _Name two burdens the Treaty of Versailles placed on Germany._

---

## 3  The Minimum‑Information Lens

Rather than “instructions,” a _principle_ is articulated: each card should interrogate a single atomic fact or relationship. The model perceives oversized answer fields (multiple sentences, list enumerations) as signals that the candidate should be split or re‑chunked.

_Dead Sea example (principle in action)_  
A bloated prompt asking for _all_ geographic, chemical, and historical attributes produces recall failures. Fragmentation into:

- _Where is the Dead Sea located?_
    
- _What is Earth’s lowest surface elevation?_
    
- _Why is the Dead Sea unusually buoyant?_  
    achieves better long‑term retention with minimal review load.
    

---

## 4  Balancing Breadth and Granularity

### 4.1  Hierarchical Structuring

Broad prompts (e.g., _“Outline glycolysis.”_) coexist with micro‑prompts (e.g., _“Which enzyme catalyses the phosphofructokinase step?”_). The LLM treats hierarchy as a compression tool: one high‑level card can implicitly rehearse numerous low‑level facts, yet subordinate cards remain available for elements the learner demonstrably forgets.

### 4.2  Chunking and Mnemonics

Certain fixed sequences—such as the OSI layers—are stored more economically via a mnemonic chunk. A single card referencing _“All People Seem To Need Data Processing”_ may suffice.

---

## 5  Formulating the Q and the A

### 5.1  Characteristics of a Robust Prompt

- **Clarity**: future‑proof wording with explicit context (“According to Kepler’s Third Law…”).
    
- **Unambiguity**: no hidden plurals, no double‑barrel “and/or.”
    
- **Conciseness**: answers target one word, phrase, number, or sentence.
    

### 5.2  Question Archetypes

|Archetype|Suitable for|Example Q|Example A|
|---|---|---|---|
|Definition|Terms, labels|What is _osmotic pressure_?|Pressure needed to stop osmosis|
|How/Why|Mechanisms|Why does raising temp speed reactions?|More molecules exceed activation energy|
|Comparison|Contrasts|Diploid vs. haploid outcome of meiosis?|Meiosis → haploid; mitosis → diploid|
|Cloze|In‑context facts|Photosynthesis occurs in the ___.|Chloroplast|

_(Note: table provided for conceptual taxonomy; not intended as an instruction.)_

---

## 6  Reducing Redundancy Without Losing Coverage

The guide’s perspective is that duplication is acceptable only where reverse recall materially strengthens learning. A forward card _“What substrate does amylase digest?”_ and its mirror _“Which enzyme breaks down starch?”_ warrant inclusion due to their complementary retrieval cues; blanket bidirectional duplication does not.

---

## 7  Iterative Deck Hygiene

Although no explicit “actions” are prescribed, the model anticipates that a healthy deck evolves: irrelevant cards can be flagged for removal, overly broad ones for splitting, and easy micro‑cards for possible suspension once mastery is evident through performance data.

---

## 8  Illustrative End‑to‑End Transformation

**Source bullet list (lecture slide):**

- _Photosynthesis converts solar energy into chemical energy._
    
- _Chlorophyll absorbs mainly red and blue light._
    
- _The Calvin cycle synthesises glucose from CO₂._
    

**Potential flashcard set, post‑principle application:**

1. Q: _What process converts solar energy into chemical energy in plants?_  
       A: Photosynthesis.
    
2. Q: _Which pigment is primarily responsible for light absorption in photosynthesis?_  
       A: Chlorophyll.
    
3. Q: _Which wavelengths does chlorophyll absorb most strongly?_  
       A: Red and blue.
    
4. Q: _What cycle fixes CO₂ into glucose during photosynthesis?_  
       A: The Calvin cycle.
    

Four discrete cards capture the slide’s essence without redundancies.

---

## 9  Organisational Aids

While the guide excludes task directives, it notes that tagging cards by topic, chapter, or importance enables downstream schedulers to filter or prioritise seamlessly. Semantic chunkers or note‑taking plugins that emit Q/A patterns merely furnish raw material; a extraction lens above governs final selection.

---

## 10  Subject‑Specific Nuances (Brief Observations)

|Domain|Tendency|Recommended Grain|
|---|---|---|
|Mathematics/Physics|Conceptual interdependence|Lean on problem‑level cards; keep formula cards atomic|
|Medicine/Biology|Fact‑dense|High granularity; suspend low‑value trivia|
|History|Narrative chains|Mix event cards with summary‑story prompts|

---

### Closing Perspective

The extraction mindset rests on three pillars: **understand first**, **question only what is worth forgetting**, and **keep each prompt as lean as functionally possible**. By applying these lenses—without step‑by‑step imperatives—an LLM can yield a flashcard corpus that maximises retention and minimises learner workload.
-- END PROMPT--`; 