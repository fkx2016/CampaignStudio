# 🧠 AI Architecture: Mode-Aware Intelligence System

## Overview
Campaign Studio's AI must understand **context** (what mode are we in?) and **intent** (what is the user trying to achieve?). This document outlines the architecture for building a sophisticated, mode-aware AI system that can optimize content for different campaign types and platforms.

---

## 0. Environment Agnostic Architecture
**"Code Once, Run Everywhere"**

Campaign Studio is designed to run seamlessly in two distinct environments using a single codebase:

1.  **SaaS (Cloud/Web):**
    *   **Frontend:** Next.js hosted on Vercel/AWS.
    *   **Backend:** FastAPI on cloud containers (Docker/K8s).
    *   **Database:** PostgreSQL (Cloud-managed).
    *   **Auth:** Cloud-based (OAuth/Email).

2.  **Local (Desktop/Offline):**
    *   **Frontend:** Next.js wrapped in Electron/Tauri or running locally.
    *   **Backend:** FastAPI running as a local process.
    *   **Database:** SQLite (Local file).
    *   **Auth:** Local Mode (No sync) or Cloud Login (Optional sync).

**Implications for AI & Modes:**
*   **Mode Definitions:** Stored in the database (SQLModel) so they work identically on SQLite and Postgres.
*   **AI Processing:**
    *   *Cloud:* Calls our central API gateway.
    *   *Local:* Calls the user's own API key (BYOK) or a local LLM (Llama 3 via Ollama).

---

## 1. The Mode System

### What is a "Mode"?
A **Mode** represents a distinct campaign archetype with its own:
- **Tone** (Empathetic, Provocative, Professional, Urgent)
- **Structure** (Storytelling, Call-to-Action, Educational, Persuasive)
- **Goals** (Awareness, Conversion, Engagement, Education)
- **Constraints** (Platform rules, character limits, audience expectations)

### Initial Modes
1. **Donation/E-Begging** - Empathetic storytelling with clear CTAs
2. **Political** - Provocative, engagement-focused, Socratic questioning
3. **Selling/Commerce** - Benefit-driven, conversion-optimized
4. **Education** - Clear, structured, authority-building
5. **Promotion** - Hype-building, FOMO-driven
6. **Awareness** - Informative, shareable, broad appeal

### Mode Schema (Database)
```python
class Mode(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str  # "Political", "Donation", etc.
    slug: str  # "political", "donation"
    description: str  # User-facing explanation
    
    # AI Guidance
    tone_guidelines: str  # "Provocative but not offensive. Question assumptions."
    structure_template: str  # "Hook → Evidence → Question → CTA"
    example_prompts: str  # JSON array of example good posts
    
    # Constraints
    preferred_platforms: str  # JSON array of platform slugs
    optimal_length_range: str  # "100-280 chars" or "500-1000 words"
    
    # Metadata
    is_active: bool = True
    created_at: datetime
```

---

## 2. The Prompt Engineering Stack

### Layer 1: Base Prompts (Simple)
**Current State:** Hardcoded prompts for quick wins
```python
SIMPLE_PROMPTS = {
    "shorten": "Rewrite this in under 280 characters while keeping the core message.",
    "professional": "Rewrite this in a professional, LinkedIn-appropriate tone.",
    "provocative": "Rewrite this to be more engaging and thought-provoking.",
    "add_cta": "Add a clear call-to-action to this post."
}
```

**Use Case:** MVP, quick iteration, user feedback

---

### Layer 2: Mode-Aware Prompts (Intermediate)
**Goal:** Incorporate mode context into prompts

```python
def build_mode_prompt(text: str, mode: Mode, optimization: str) -> str:
    base = f"""
    You are optimizing content for a {mode.name} campaign.
    
    Tone Guidelines: {mode.tone_guidelines}
    Structure: {mode.structure_template}
    
    Original Text:
    {text}
    
    Task: {optimization}
    
    Optimized Version:
    """
    return base
```

**Use Case:** Phase 2, after mode schema is defined

---

### Layer 3: DSPy Orchestration (Advanced)
**Goal:** Optimize prompts automatically based on performance

```python
import dspy

class CampaignOptimizer(dspy.Module):
    def __init__(self):
        super().__init__()
        self.optimize = dspy.ChainOfThought("text, mode, platform -> optimized_text")
    
    def forward(self, text, mode, platform):
        # DSPy handles prompt optimization based on feedback
        return self.optimize(text=text, mode=mode, platform=platform)
```

**Use Case:** Phase 3, after we have user engagement data to train on

---

### Layer 4: TQL/QRC (Quantum Layer)
**Goal:** Context-aware reasoning with question-response chains

**TQL (The Question Layer):**
- AI asks clarifying questions before optimizing
- "Is this post trying to convert or educate?"
- "What emotion should the reader feel?"

**QRC (Question-Response Context):**
- Maintains conversation state across multiple AI interactions
- Learns user preferences over time
- "Last time you optimized a political post, you preferred Socratic questions"

```python
class TQLEngine:
    def optimize_with_context(self, text, mode, user_history):
        # Step 1: Ask clarifying questions
        questions = self.generate_questions(text, mode)
        
        # Step 2: Use user history to infer answers
        inferred_answers = self.infer_from_history(questions, user_history)
        
        # Step 3: Build context-rich prompt
        context = self.build_qrc(questions, inferred_answers)
        
        # Step 4: Optimize with full context
        return self.optimize(text, mode, context)
```

**Use Case:** Phase 4, the "AI that knows you" experience

---

## 3. The API Architecture

### Endpoint: `/api/ai/optimize`
**Request:**
```json
{
  "text": "We need your help to fight corruption!",
  "mode": "political",
  "platform": "x",
  "optimization_type": "provocative",
  "user_id": 123  // For TQL/QRC context
}
```

**Response:**
```json
{
  "optimized_text": "Why do we accept corruption as 'normal'? 🤔\n\nWhen did we decide that was okay?\n\nJoin us in asking the hard questions. 👇",
  "reasoning": "Applied Socratic questioning technique from Political mode guidelines. Shortened for X platform. Added emoji for engagement.",
  "alternatives": [
    "Corruption isn't inevitable. It's a choice we make every day...",
    "They want you to think corruption is just 'how things work'..."
  ],
  "mode_applied": "political",
  "platform_optimized": "x"
}
```

### Backend Service Structure
```
backend/
├── ai/
│   ├── __init__.py
│   ├── prompts.py          # Prompt templates
│   ├── optimizer.py        # Main optimization logic
│   ├── dspy_engine.py      # DSPy integration
│   ├── tql_engine.py       # TQL/QRC implementation
│   └── mode_manager.py     # Mode-specific logic
├── models.py               # Add Mode model
└── main.py                 # Add /api/ai/optimize endpoint
```

---

## 4. Implementation Phases

### Phase 1: Hardcoded MVP (Week 1)
- [x] Simple prompts for 4 optimization types
- [x] No mode awareness yet
- [x] Ships fast, proves UX

### Phase 2: Mode Foundation (Week 2-3)
- [ ] Define Mode schema in database
- [ ] Seed initial 6 modes
- [ ] Build mode-aware prompt builder
- [ ] Update `/api/ai/optimize` to use modes

### Phase 3: DSPy Integration (Week 4-5)
- [ ] Install and configure DSPy
- [ ] Create training dataset from user interactions
- [ ] Implement automatic prompt optimization
- [ ] A/B test DSPy vs hardcoded prompts

### Phase 4: TQL/QRC Layer (Month 2)
- [ ] Design TQL question generation system
- [ ] Build QRC context storage (user preferences)
- [ ] Implement learning loop (AI gets smarter over time)
- [ ] Launch "AI that knows you" feature

---

## 5. Success Metrics

### Technical Metrics
- **Optimization Speed:** < 2 seconds per request
- **Prompt Token Efficiency:** < 500 tokens per optimization
- **Cache Hit Rate:** > 70% for common optimizations

### User Metrics
- **Adoption:** % of users who use AI optimizer
- **Satisfaction:** Thumbs up/down on optimized content
- **Retention:** Do users come back after using it?

### Revenue Metrics (The Real Test)
- **Engagement Lift:** Do AI-optimized posts get more likes/shares?
- **Conversion Lift:** Do AI-optimized posts drive more clicks/revenue?
- **User Earnings:** Does using the AI correlate with higher user income?

---

## 6. Open Questions & Research Areas

### LLM Selection
- **Current:** OpenAI GPT-4 (expensive but high quality)
- **Alternatives:** 
  - Claude (better at nuanced tone)
  - Llama 3 (open source, self-hosted)
  - Gemini (multimodal, good for image+text)

### Prompt Caching
- Can we cache common optimizations to reduce API costs?
- Redis layer for "shorten this political post" patterns?

### Fine-Tuning
- Should we fine-tune a model on successful Campaign Studio posts?
- Collect user feedback: "This optimization was great/terrible"

### Multimodal
- Can the AI suggest image edits based on the text optimization?
- "Your text is now provocative—add a bold red overlay to match"

---

## 7. Dependencies & Tools

### Required
- **DSPy:** `pip install dspy-ai`
- **OpenAI API:** For GPT-4 access
- **Redis:** For caching and QRC storage

### Optional (Future)
- **LangChain:** If we need complex agent workflows
- **Weights & Biases:** For tracking prompt performance
- **Anthropic Claude API:** For tone-sensitive optimizations

---

*Documented: December 2, 2025*
*Status: Architecture Planning Phase*
*Next Step: Implement Phase 2 (Mode Foundation)*
