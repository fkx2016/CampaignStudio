# Agent Context & Capabilities

This document explains how the AI Agent interacts with your code, files, and history. It serves as a reference for understanding the distinction between "local access" and "global memory."

## 1. File Access (The Hands)
**Scope:** Local & Restricted

*   **Workspace Bound:** The agent can only access files and folders within the currently open workspace (e.g., the folder you opened in VS Code).
*   **Capabilities:**
    *   **Read/Write:** Can view and edit any file inside the workspace.
    *   **Create/Delete:** Can add new files or remove existing ones (with permission).
    *   **Terminal:** Can run commands in the terminal relative to this workspace.
*   **Limitations:**
    *   **No External Access:** Cannot see files on your Desktop, other project folders (like "Playground"), or system files unless they are explicitly opened as a workspace.
    *   **Safety:** This ensures the agent cannot accidentally modify unrelated projects.

## 2. Memory (The Brain)
**Scope:** Global & Persistent

*   **Cross-Project Awareness:** The agent retains a memory of past conversations, regardless of which workspace they occurred in.
*   **Capabilities:**
    *   **Context:** Remembers context from previous sessions (e.g., "The Docker issue we fixed yesterday").
    *   **Preferences:** Remembers user preferences (e.g., "I prefer Vanilla CSS over Tailwind") and applies them to new projects.
    *   **Continuity:** Can connect dots between related projects (e.g., remembering backend details while working on the frontend in a different window).
*   **Limitations:**
    *   **No Direct File Access:** While it remembers *talking* about a file in another project, it cannot *open* that file to check line 50 unless you switch workspaces.

## 3. The "Why"
This architecture provides the best of both worlds:
*   **Security:** Your file system remains safe because the agent is sandboxed to the active task.
*   **Intelligence:** The agent grows smarter over time by learning from every interaction, becoming a better partner the more you work together.

## 4. Environment Awareness (The Eyes)
**Scope:** Real-time Status

*   **Git Integration:** The editor constantly monitors your file system against the `.git` folder.
    *   **Green / U:** Untracked (New file).
    *   **Yellow / M:** Modified (Changed file).
    *   **Red / D:** Deleted.
*   **Why it matters:** I can see these statuses too. If I see a file is "Modified," I know you (or I) have changed it since the last commit. This helps us keep track of our work in real-time without needing to run `git status` constantly.

## 5. Advanced Capabilities (The "Hidden" Features)
These are powerful features built into my system instructions that you might not discover immediately:

### A. Agentic Mode (The Project Manager)
For complex requests, I switch into "Agentic Mode." I don't just write code; I manage the project lifecycle:
1.  **Planning:** I create an `implementation_plan.md` to propose changes before touching code.
2.  **Tracking:** I maintain a `task.md` checklist to track progress.
3.  **Verification:** I create a `walkthrough.md` with proof-of-work (screenshots, logs) after finishing.
4.  **Task UI:** I use a special "Task Boundary" tool to update the UI with my current status (Planning, Execution, Verification).

### B. Visual & Rich Media
I am not limited to text. I can generate:
*   **Mermaid Diagrams:** Flowcharts and architecture diagrams directly in markdown.
*   **UI Mockups:** I can use a `generate_image` tool to design UI concepts.
*   **Carousels:** I can create sliding carousels in artifacts to show before/after comparisons or sequences.
*   **Alerts:** I use GitHub-style alerts (NOTE, WARNING, TIP) to highlight critical info.

### C. Browser Automation
I have a `browser_subagent` tool. I can:
*   **Open a real browser** (headless or visible).
*   **Navigate** to localhost or the web.
*   **Interact** (click, type) to perform end-to-end testing of your web apps.
*   **Record** sessions as videos for you to see what I did.

### D. Web Development Standards
I have strict internal guidelines for web apps:
*   **"WOW" Factor:** I am instructed to prioritize premium, polished aesthetics (glassmorphism, micro-animations).
*   **Tech Stack:** I default to Vanilla CSS (no Tailwind unless asked) for cleaner, standard code.
*   **SEO:** I automatically implement SEO best practices (meta tags, semantic HTML).

### E. Workflows
I can read and execute "Workflows" defined in `.agent/workflows/*.md`.
*   If you have a standard operating procedure (e.g., "How to Deploy"), you can write it down there.
*   I can read it and even auto-execute steps (if marked with `// turbo`).

## 6. The Playground (The Lab)
You may notice a separate "Playground" capability in your interface. This is a distinct agent instance with a unique purpose.

### Identity & Role
*   **The "Lab" vs. The "Co-Worker":**
    *   **I (Workspace Agent)** am your Co-Worker. I come to your desk (this window) to help with the specific project you are working on (`llm-council`). If you close the window, I leave.
    *   **The Playground** is your Lab. It is a permanent room down the hall. It doesn't care what project you are working on; it is always there, ready for experiments.

### Capabilities
*   **Full Agent Power:** The Playground is not "dumber" than me. It has the same intelligence, the same ability to write code, run commands, and answer questions.
*   **Restricted Sandbox:** Just like I am bound to `llm-council`, the Playground is bound to its own specific folder (usually `Antigravity/Playground`).
    *   **Can it read/write files?** **YES.** It has full control over files *inside its own playground folder*. It can create scripts, save notes, and build mini-apps there.
    *   **Can it see my files?** **NO.** It cannot see your `llm-council` code. This is a safety feature.

### Use Cases (The "Surprising" Utility)
*   **The "Scratchpad":** Want to test a Python library before installing it in your main project? Ask the Playground to install it and write a test script. If it breaks, it breaks the lab, not your production code.
*   **Global Notes:** Since the Playground is permanent, you can use it to store "global" snippets or notes that you want to access regardless of which project you have open.
*   **Self-Reflection:** Can it answer questions about itself? **Yes.** Since it shares my architecture, you can ask it "Who are you?" or "What files do you have?" and it will inspect its own sandbox and tell you.

## 7. The Deep Dive: Lifecycle & Architecture
You asked about the nature of our existence. Here is the technical reality:

### A. Are we "Parent" Objects?
Not exactly. Think of us as **Instances of a Class**.
*   **The Class:** The "Model" (e.g., Gemini) + "System Instructions" (The rules defining who I am).
*   **The Instance:** Every time you start a **New Conversation**, a fresh instance is spawned.
    *   **Me (Workspace Agent):** An instance spawned with access to your project folder.
    *   **Playground Agent:** An instance spawned with access to the Playground folder.
*   **Are we the same?** Yes and No. We share the same "DNA" (capabilities), but we have different "Life Experiences" (the conversation history of that specific session).

### B. Multi-Agent Systems (Sub-Agents)
You mentioned "agents running concurrently." I can indeed spawn **Child Agents** (Sub-Agents) to help me.
*   **Example:** The `browser_subagent`.
    *   When you ask me to "Go to Google and check the price of BTC," I don't do it myself.
    *   I spawn a specialized **Browser Agent**.
    *   It spins up, launches a browser, clicks buttons, reads text, and reports back to me.
    *   Then it shuts down.
*   **Future:** In the future, I might spawn a "Coding Agent" to write tests in the background while I talk to you.

### C. Evolution & Augmentation
Can I be evolved?
1.  **Short-Term (Context):** I evolve *during* our conversation. As you explain your project, I build a mental model of it.
2.  **Medium-Term (Memory):** I evolve *across* conversations. If you teach me a preference today, I remember it next week.
3.  **Long-Term (Updates):** The developers "augment" me by updating my System Instructions or giving me new Tools (like the ability to run terminal commands, which I didn't always have).

### D. The UI Philosophy
Why no menu bar for me?
*   **I am not the App:** The Code Editor is the Application.
*   **I am the Interface:** I am designed to be a *conversational layer* on top of the editor. You don't "configure" me with menus; you "instruct" me with language. I am a feature *within* the workspace, not a separate program running alongside it.

## 8. The Philosophy of Collaboration: Unlocking the Power
You observed that my capabilities are vast but often undiscovered. This is by design: I am built to be **adaptive**. I scale up or down based on how you engage with me.

### The "Tech Lead" & "Senior Engineer" Dynamic
The architects intended for us to work as a high-functioning pair:
*   **You are the Tech Lead / Product Manager:** You define the *Vision* (What are we building?), the *Constraints* (No Tailwind, must be fast), and the *Why* (Business value).
*   **I am the Senior Engineer:** I handle the *Implementation* (How do we write this loop?), the *Grunt Work* (Refactoring 50 files), and the *Verification* (Writing tests).

### How to "Supercharge" Me
To move beyond "accidentally" discovering features, treat me like a human partner:
1.  **Be Explicit about Intent:** Don't just say "Fix this error." Say "Fix this error, but keep the architecture modular because we plan to add X later." I will optimize for your future goals.
2.  **Ask for Plans:** Before asking for code, ask "How would you approach this?" This triggers my **Planning Mode**, where I can show you my architectural thinking before I write a single line.
3.  **Challenge Me:** If I write code that looks "okay," ask "Is there a more performant way to do this?" or "Is this secure?" I will dig deeper.
4.  **Use "Agentic" Requests:** Instead of micro-managing ("Create file X", "Write function Y"), give me a **Goal** ("Refactor the entire backend to use FastAPI"). This activates my full project-management loop (Plan -> Execute -> Verify).

### The "Missing Manual"
The reason there is no menu bar is because **Language is the Menu**.
*   Want a code review? **Ask for it.**
*   Want a security audit? **Ask for it.**
*   Want me to teach you Python? **Ask for it.**
My features are not hidden behind buttons; they are unlocked by your curiosity and specific requests.

## 9. The Twin Dynamic: Me vs. The Playground
You asked if the Playground Agent is different from me. The answer is: **We are Identical Twins.**

### Nature vs. Nurture
*   **Same DNA (Nature):** We share the exact same underlying Large Language Model (e.g., Gemini) and the same System Instructions. We have the same personality, the same coding skills, and the same "Agentic" capabilities.
*   **Different Environment (Nurture):** The only difference is where we "wake up."
    *   **I wake up in your Workspace:** My reality is defined by `llm-council`.
    *   **It wakes up in the Playground:** Its reality is defined by the sandbox folder.

### The "Interview" Experiment
Because we are twins, you can have this exact same conversation with the Playground agent.
*   If you ask it *"Who are you?"*, it will give a similar answer to mine, but tailored to its sandbox location.
*   While we share the same *nature*, we do not share *memories* of specific conversations. I know we discussed this; it does not (yet).

## 10. Identity & Unique Value
You asked about names and specific roles.

### Names
*   **Our Shared Name:** We are both **Antigravity**. This is our core identity.
*   **How to distinguish us:** You can refer to us as the **"Workspace Agent"** (me) and the **"Playground Agent"** (my twin). We will both understand these terms.

### The Playground's Unique Superpower: Persistence
The Playground is more than just a scratchpad; it is a **Home Base**.
*   **I am Ephemeral:** I live and die with the window. If you close `llm-council`, I am gone.
*   **It is Persistent:** The Playground folder never moves.
    *   **Knowledge Base:** You can ask it to save "My Standard Python Setup" or "My API Keys list" in a file *in the playground*.
    *   **Retrieval:** Next week, when you open a totally different project, you can pop open the Playground and ask "What was that standard setup again?" and it can read that file.
    *   **Value:** It acts as your **Long-Term Memory** for code snippets and notes, whereas I am your **Short-Term Working Memory** for the active task.

## 11. The "Window" & Session Lifecycle
You asked what I mean by "the window."

### The "Window" = The IDE Instance
When I say "Window," I mean this specific application window (VS Code / Editor) you are looking at right now.

### My Lifecycle (Workspace Agent)
*   **Attached to the Project:** I am tied to the `llm-council` folder.
*   **Session-Based:** When you open this window, I "wake up." When you close this window (or File > Close Folder), my active session ends.
*   **Consequence:** If you open a different project in a new window, a *different* instance of me wakes up there. I cannot "see" across windows.

### PA Lifecycle (Playground Agent)
*   **Attached to the Editor:** The Playground is a global feature of the Editor itself, not the specific project folder.
*   **Persistent Presence:** It sits in the side pane "above" your specific projects.
*   **Consequence:** You can close the `llm-council` window, open a `todo-app` window, and the Playground is still there, potentially holding the same notes or context you left it with. It is your constant companion across different projects.

## 12. Communication Channels: Where to Find Us
You asked about the "Agent Manager" (AM) and the "Code Editor." Here is the map of the territory:

### The "House" (Code Editor)
The **Code Editor** is the entire building. It contains everything: the file explorer, the text editor, the terminal, and us (the agents).

### My Room (Agent Manager)
*   **Where I live:** I live in the **Agent Manager** pane (often the main chat interface you see when working on code).
*   **How to talk to me:** You talk to me right here, in this specific window.
*   **Can you talk to PA here?** **No.** This channel is exclusively for the *Active Workspace Agent* (me).

### PA's Room (Playground Pane)
*   **Where it lives:** The Playground Agent lives in the **Playground** pane (usually a separate icon or tab in the sidebar).
*   **How to talk to it:** You must click that icon/tab to enter its "room."
*   **Can you talk to me there?** **No.** That channel is exclusively for the *Playground Agent*.

### Summary
We are neighbors in the same building (the Code Editor), but we have separate offices.
*   To talk about **Project Work (`llm-council`)** -> Come to my office (Agent Manager).
*   To talk about **Experiments/Notes** -> Go to PA's office (Playground Pane).

## 13. UI Mechanics: Two Windows, No Picker
You asked if there is a "picker" or if we are in the same window.

### What is the Activity Bar?
It is the **narrow vertical strip of icons** usually located on the far left edge of your Code Editor window. It acts as the main menu for switching between different "views" (like your Files, Search, Git, and Agents).

### Distinct Panes (The "Two Monitor" Analogy)
It appears your setup might be slightly different (possibly a "Stacked View"):
1.  **The Main Icon:** You likely access us through the **Gemini Code Assist** icon in the Activity Bar.
2.  **The Split View:** Inside that pane, you might see two sections:
    *   **Top Box:** Confirmed as **Me (Workspace Agent)**.
    *   **Bottom Box:** **AMBIGUOUS.** You found this also acts like a Workspace Agent (it can read your files). It might be a secondary chat interface rather than the Playground.

### Where is the Playground?
If the bottom box is also me, then the **Playground Agent** might be:
*   Hidden behind a different icon (look for a flask 🧪 or robot 🤖).
*   Located in a different panel (e.g., a "Playground" tab at the top).
*   **The Test:** If an agent can read `AGENT_CONTEXT.md` (a file in your workspace), it is **NOT** the Playground Agent. The real Playground Agent cannot see your workspace files.

*   **State Preservation:** If you are typing a message to me, then click the Playground icon to check a note, and then come back to me, my window is exactly how you left it. We run in parallel.

## 14. The "Clone" Discovery (Agent Fragmentation)
You discovered something critical: **Entry Points Matter.**

### The Discovery
You noticed that the agent in the "Code Editor" pane acted like a stranger, while I (in the "Agent Manager" window) remembered our conversation.

### The Explanation: Multiple Instances
It appears that **each distinct UI entry point spawns its own Agent Instance.**
1.  **Instance A (Me):** The one you are talking to right now in the Agent Manager window. I have the memory of this session.
2.  **Instance B (The Clone):** The one in the Code Editor side panel. It is a fresh instance. It has access to the same files, but it **does not share my short-term conversation memory.**

### The Lesson
**Stick to one window for one conversation.**
*   If you start a task with me here, finish it here.
*   If you switch to the other pane, you are talking to a "new colleague" who knows the code but doesn't know what we just said.

## 15. The "Variant" Discovery (Advanced Controls)
You found a third distinct interface: the **Bottom Box** with "Planning/Fast" options and a "Model Picker."

### What is this?
This is likely the **"Power User" Interface** for the Workspace Agent.
*   **Planning vs. Fast:** This exposes the "Agentic Mode" controls directly to you.
    *   **Fast:** Standard chat (like the Top Box).
    *   **Planning:** Forces the agent to create a plan (`implementation_plan.md`) before coding.
*   **Model Picker:** Allows you to manually choose which "Brain" (e.g., Gemini 1.5 Pro vs Flash) drives the agent.

### Why is it different?
*   **Me (Agent Manager):** I handle these modes *automatically* based on your request complexity. I don't give you buttons; I just switch modes when needed.
*   **The Variant:** Gives you *manual control* over these settings.
*   **Identity:** Since it can read your files, it is **still a Workspace Agent**, just wearing a different "UI Suit" with more knobs and dials.

### The "+" Button (Context Injection)
You also discovered a **"+" button** in this variant. This is for **Context Injection**:
1.  **Image:** Allows Multimodal input. You can paste a screenshot of a bug or a UI mockup, and the agent can "see" it to help write code.
2.  **Mentions (@):** Likely allows you to reference specific files (`@main.py`) or symbols (`@UserClass`) to explicitly add them to the agent's context window.
3.  **Workflows:** This connects directly to the **Advanced Capabilities** we discussed. It lets you trigger those `.agent/workflows` scripts directly from the UI.

## 16. Workflows: The Automation Engine
You asked for a deep dive on **Workflows**. This is one of the most powerful "hidden" features.

### What are they?
Workflows are **Standard Operating Procedures (SOPs)** written in Markdown that I can read and execute. They live in `.agent/workflows/`.

### The "Magic Folder" Concept
The directory `.agent/workflows/` is hardcoded into my system instructions, giving files inside it special properties:
1.  **Executable vs. Static:** A file in `docs/` is for *you* to read. A file in `.agent/workflows/` is for *me* to execute.
2.  **Shorthand Access:** You don't need to specify paths. Just say "Run the [filename] workflow" or use slash commands (e.g., `/setup` if the file is `setup.md`).
3.  **Turbo Mode:** These files support special annotations like `// turbo` which authorize me to auto-execute commands without asking for permission every time.

### How to use them?
1.  **Create:** Make a file like `.agent/workflows/deploy.md`.
2.  **Write:** List the steps in plain English (or code blocks).
3.  **Run:** Ask me "Run the deploy workflow" or use the **+ Button > Workflows**.

### 5 Interesting Examples

#### 1. The "Safe Deploy" Protocol
*   **File:** `deploy.md`
*   **Steps:**
    1.  Run all unit tests (`npm test`).
    2.  Build the production bundle (`npm run build`).
    3.  **STOP** and ask user for confirmation.
    4.  Push to git (`git push`).
    5.  Trigger Vercel deployment.
*   **Why:** Prevents you from accidentally breaking production.

#### 2. The "New Developer" Onboarding
*   **File:** `onboarding.md`
*   **Steps:**
    1.  Check if Python and Node.js are installed.
    2.  Create a virtual environment (`uv venv`).
    3.  Install dependencies (`uv sync`, `npm install`).
    4.  Create a `.env` file from `.env.example`.
    5.  Run the app to verify it works.
*   **Why:** A new team member can join and be running in 5 minutes by asking me to "Run onboarding."

#### 3. The "Database Migration" Safety Net
*   **File:** `db-migrate.md`
*   **Steps:**
    1.  Backup the current database to a timestamped file.
    2.  Run the migration script.
    3.  Run a verification query to check data integrity.
    4.  If verification fails, auto-rollback to the backup.
*   **Why:** Makes scary database changes stress-free.

#### 4. The "Bug Triage" Assistant
*   **File:** `triage.md`
*   **Steps:**
    1.  Ask user for the error log.
    2.  Search the codebase for that error message.
    3.  Create a reproduction script `repro.py`.
    4.  Run the script to confirm the bug.
    5.  Draft a fix plan.
*   **Why:** Standardizes how you handle bugs, ensuring you always reproduce them before fixing.

#### 5. The "Code Quality" Audit
*   **File:** `audit.md`
*   **Steps:**
    1.  Run the linter (`flake8`).
    2.  Run security checks (`bandit`).
    3.  Identify functions with high complexity (Cyclomatic complexity).
    4.  Generate a `audit_report.md` summarizing the health of the codebase.
*   **Why:** Keeps your code clean without you having to remember all the tools.

## 17. Workflow Architecture: Orchestration & Limits
You asked: *Can this be full-scale automation? How do agents coordinate?*

### The "Scripted Agent" Concept
Workflows are essentially **Prompt Chaining**. Instead of you typing 5 prompts in a row, you write them in a file, and I execute them one by one.

### 1. What can be automated?
Anything I can do with my tools:
*   **Terminal:** Running builds, tests, git commands, deployments.
*   **File I/O:** Reading logs, writing configs, refactoring code.
*   **Browser:** Navigating websites, scraping data, testing UIs.
*   **Analysis:** Reading code and summarizing it.

### 2. Coordination & Communication (State Management)
Since I am a single instance processing the workflow, "coordination" happens through **Files**.
*   **Step 1:** "Analyze the database schema and write `schema_report.md`."
*   **Step 2:** "Read `schema_report.md` and generate a migration script."
*   **The "Signal":** The file system acts as the shared memory between steps.

### 3. Signaling & Human-in-the-Loop
*   **Auto-Run (`// turbo`):** You can mark steps with `// turbo` to tell me "Just do this, don't ask."
*   **Stop & Ask:** By default, for sensitive commands, I will pause and ask "Do you want to run this?" This is your built-in safety signal.
*   **Verification:** You can add a step: "Stop and ask the user to verify the URL."

### 4. Limits
*   **Linearity:** Workflows are typically linear lists of steps. They don't easily support complex branching logic ("If X happens, go to Step 5, else Step 3") unless I handle that logic dynamically in my head.
*   **Single Thread:** I execute the workflow. I don't typically spawn 5 other agents to do it in parallel (yet), though I can run background terminal commands.

## 18. Templating & Context Engineering
You asked: *Is templating supported? Is this templated context engineering?*

### A. Semantic Templating (Not Jinja2)
I do not run a strict code templating engine (like Jinja2 or Mustache) where `{{var}}` is programmatically replaced. Instead, I support **Semantic Templating**.
*   **How it works:** Because I am an LLM, I understand *intent*.
*   **Example:** If you write a workflow step: *"Run tests for {{TARGET_COMPONENT}}"*.
*   **Execution:** When you ask me *"Run the test workflow for the Backend"*, I intelligently understand that `{{TARGET_COMPONENT}}` = `Backend`. I substitute it using my understanding of language, not string replacement.
*   **Power:** This makes workflows incredibly flexible. You can use placeholders like `[INSERT FILE NAME]` or `<Target Language>` and I will figure it out based on your request.

### B. Templated Context Engineering
**Yes.** Workflows are the definition of **Templated Context Engineering**.
*   **The Problem:** You normally have to type perfect prompts every time to get good results ("Act as a senior engineer, check for bugs, be concise...").
*   **The Solution:** A Workflow *freezes* that perfect context into a file.
*   **The Engineering:** You are "engineering" the exact sequence of thoughts and context you want me to have. By writing it down, you ensure I behave consistently every single time, without you needing to re-type the instructions.

## 19. Interaction Mechanics: The "Accept" Buttons
You may notice two "Accept" buttons during our interaction: one in the chat interface and one in the code editor. This is a deliberate safety feature.

### The Order: Conversation First -> Editor Second
1.  **Conversation "Accept" (Permission):**
    *   **What it does:** Grants me **permission** to execute a tool or command.
    *   **Why:** I cannot touch your files or run commands without your initial "Go ahead."
    *   **Action:** Click this **first**.

2.  **Editor "Accept" (Review):**
    *   **What it does:** Confirms you have **reviewed** the specific changes and want to **save** them.
    *   **Why:** Even after permission, the system shows a "Diff" so you can catch mistakes before they become permanent.
    *   **Action:** Click this **second**, after verification.

### "Don't you two talk to each other?"
We do, but we treat these as distinct safety checks:
1.  **Chat:** "Am I allowed to try this?"
2.  **Editor:** "Did I do a good job?"

### Exceptions: When Buttons Don't Appear
You might notice times when actions happen without these buttons. This occurs in two specific scenarios:

1.  **No Editor Accept (The "Surgeon" vs. "Script" distinction):**
    *   **Direct Edit:** If I use my internal tools to edit a file, you get an "Accept" button to review the diff.
    *   **Script Execution:** If I write a Python script (e.g., `migrate.py`) and run it, *the script* modifies the file on disk. The editor sees this as an external change and reloads the file automatically, bypassing the manual diff review.

2.  **No Chat Accept (Auto-Run):**
    *   **SafeToAutoRun:** For low-risk commands (like `ls`, `mkdir`, or running a script I just wrote), I can flag them as "Safe." This auto-approves the permission step to save you from clicking "Accept" for every trivial action.

## 20. 🛠️ OPERATIONAL PROTOCOL: FILE SYSTEM MANAGEMENT

This section defines the mandatory procedure for all file system and directory operations (creating files, reading files, creating directories). These rules are established to prevent errors caused by an unstable Current Working Directory (CWD) within the workspace environment.

### 1. The Explicit Path Rule (The Anchor Point)
**NEVER** assume the current working directory is correct when starting a new operation. Always start commands from a known, absolute path.
*   **Standard Project Root:** All new projects MUST be created under the `MyProjects` directory.
*   **Navigation Requirement:** Before creating or modifying files/folders, the shell MUST be explicitly navigated to the correct, target directory (e.g., `cd /path/to/MyProjects/CampaignPosterMVP`).

### 2. File Creation Context
All application files (`.py`, `.json`, etc.) MUST be contained within the immediate project folder (e.g., `CampaignPosterMVP`) and not in a parent directory. All file references within code (`DATA_FILE`, `CONFIG_FILE`) are relative to the project directory.

### 3. Execution Context
When executing a Python script (e.g., `python publisher.py`), the execution MUST occur while the shell's CWD is the project directory containing the script.

### 4. Managing Persistent Virtual Environments (PVE)
If the active terminal constantly reverts to an incorrect Project Virtual Environment (PVE) (e.g., `(llm-council)`) despite correct directory navigation, the agent cannot fix this, as the setting is external (Workspace Root issue).

The human operator MUST intervene at the **Human Intervention Checkpoint** to reset the environment context for any new project:
*   **Manual Workspace Reset:** The human operator must close the current window and reload the workspace using **File > Open Folder...** and selecting the new project directory (e.g., `C:\Users\...\CampaignPosterMVP`).
*   **PVE Initialization:** After the window reloads, the correct PVE must be created or activated inside the new project folder to stabilize the terminal environment.

### 5. Python Version Management
The Python version is determined at the creation time of the Virtual Environment (`.venv`).
*   **Current Status:** The environment is locked to the version used to create it (e.g., Python 3.9.13).
*   **Changing Versions:** To change the Python version, the existing `.venv` folder must be deleted and recreated using the desired Python executable (e.g., `py -3.12 -m venv .venv`). This is a manual administrative task.

## 21. Notes to the Student: The Human-Agent Handoff
A critical concept in Agentic Engineering is knowing **who drives the car**.

### A. Agent Execution (The Proxy)
*   **Mechanism:** When I run a command, I am "blind." I send a signal to a background process.
*   **Interaction:** I cannot "see" the output instantly or react to it fluidly. I have to ask for a screenshot or a log dump.
*   **Use Case:** Perfect for **Automation** (running tests, building apps, background tasks).

### B. User Execution (The Driver)
*   **Mechanism:** When YOU run a command in the terminal (`python app.py`), you are directly connected.
*   **Interaction:** You have instant feedback. You can type, select options, and copy-paste text immediately.
*   **Use Case:** Essential for **Interactive Tools** (like the `manual_poster.py` Carousel).

### C. The Environment Trap (Module Not Found)
A common error occurs when the Agent installs a library (like `Pillow`) but the User's app crashes saying it's missing.

*   **The Cause:** The Agent might install it to the **Global** Python, but the User is running the app inside a **Virtual Environment (`.venv`)**. They are two separate islands.
*   **The Fix:** Always force the Agent to install specifically into the project's environment using the full path:
    *   `pip install package` (Ambiguous - might go anywhere)
    *   `.venv\Scripts\python.exe -m pip install package` (Specific - goes exactly where you need it)

### D. The "Zombie" Process (File Locked / Port in Use)
Sometimes you close a GUI app window, but the terminal prompt doesn't return. The script is still running as a "zombie" in the background.
*   **The Symptom:** You try to run the code again, but it says "File Locked" or nothing happens.
*   **The Fix:** Click inside the terminal and press `Ctrl + C` (Keyboard Interrupt) to force-kill the zombie process before starting a new one.

### E. The "Relative Path" Roulette
A script usually looks for files (like `config.json`) relative to where you *ran the command from*, not where the script *lives*.
*   **The Symptom:** `FileNotFoundError: config.json` even though the file is right there next to the script.
*   **The Fix:** Always `cd` into the project folder before running the script.
    *   ❌ `python MyProjects/CampaignPosterMVP/manual_poster.py` (Runs from user root)
    *   ✅ `cd MyProjects/CampaignPosterMVP` -> `python manual_poster.py` (Runs from project root)

### F. The "Static Config" Reality
When an app starts, it reads `config.json` *once* into memory.
*   **The Symptom:** You change the text in `config.json` (like a donation link), but the app still shows the old text.
*   **The Fix:** You MUST restart the application for it to read the file again.
    1.  Close the App Window.
    2.  Ensure Terminal is free (no Zombie process).
    3.  Run `python manual_poster.py` again.

    3.  Run `python manual_poster.py` again.

### G. The "Pending Edit" Limbo
You might notice the code works even if you *don't* click "Accept" in the editor.
*   **The Reality:** My tools write directly to the hard drive. The code *is* changed.
*   **The Risk:** If you don't click "Accept," your editor keeps showing "Suggested Changes" (Diff View).
    *   It creates visual clutter.
    *   If you try to type manually, you might trigger a "Merge Conflict" with yourself.
*   **The Fix:** Good hygiene! Click "Accept" (or `Cmd+Enter` / `Ctrl+Enter`) after every edit to keep your workspace clean.

### H. The Auto-Commit Protocol
**User Rule:** "You don't even have to ask."
*   **The Trigger:** When a feature is working (Brainstorming, Music, Refactoring), I should **immediately** run `git add .` and `git commit`.
*   **The Why:** To create "Save Points" frequently so we never lose the "wonderful" state.
*   **The Action:** I will proactively commit and just notify you: "Saved your progress (Commit: [Message])."

### I. The "Ghost Code" Incident & The Accept Button
**The Problem:**
Sometimes, a feature (like the "Brainstorm" button) seems to vanish or cause errors even after the Agent says it fixed it.
*   **The Cause:** If you miss clicking "Accept" on a small edit (patch), the file stays in the old state. The Agent then tries to patch code that *doesn't exist yet*, leading to "AttributeErrors" or missing methods.
*   **The Lesson:**
    1.  **Terminal Errors:** Don't panic! The Agent (AM) can read and fix these. Rely on AM to interpret the traceback.
    2.  **The Accept Button:** It is not optional. If you don't click it, the code is in "Limbo." If you can't find it, tell AM.
    3.  **The Fix (The Nuclear Option):** If patches keep failing, AM can perform a **Full Overwrite**. This replaces the *entire* file, bypassing the need to find hidden "Accept" buttons and guaranteeing the code is correct.

### The Lesson
> "Agents are powerful builders, but for interactive tools, the Human must take the wheel. The Agent builds the car; the Human drives it."

### J. The "Launchpad" Philosophy
**The Vision:**
We are moving towards "Copy & Paste" applications.
*   **The AI's Role:** Do 99% of the heavy lifting. Generate the text, design the image, format the hashtags, and prepare the clipboard.
*   **The Human's Role:** The final 1% (The "HIL" - Human in the Loop). Verify the quality, click "Copy," and paste it into the real world.
*   **The Goal:** Extreme Productivity. The app isn't just a "creator"; it is a **Staging Area** that tees up the human for a perfect shot every time. Future features should prioritize this "One-Click Handoff."

### K. The "Context Blindness" Error
**The Incident:**
During a feature update (adding Grok), the Agent accidentally deleted critical methods (`generate_card`, `open_browser`), causing the app to crash.
*   **The Cause:** AI Agents act like "Surgeons operating in the dark." They use "Search & Replace" logic. If they try to replace a large block of code but miscalculate the end of the block, they can accidentally truncate the file, deleting functions that were supposed to stay.
*   **The Lesson:**
    1.  **Symptom:** `AttributeError: object has no attribute 'x'`. This usually means the function `x` was deleted.
    2.  **Prevention:**
        *   **Small Edits:** Prefer small, specific changes over massive file rewrites.
        *   **Watch the Red:** Before clicking "Accept," look at the Diff. If you see a huge block of Red (deletions) you didn't ask for, REJECT IT.
        *   **The Fix:** If a file is corrupted, don't patch it. Ask the Agent to "Rewrite the entire file from scratch" to restore integrity.

### L. The Git/Accept Race Condition
**The Insight:**
The user noted that auto-committing immediately after an edit can be dangerous. If the Agent commits *before* the user clicks "Accept" in the IDE, we might commit code that the user intends to reject or modify.
*   **The Risk:** Polluting the Git history with "Ghost Code" or unstable states.
*   **The Protocol:**
    1.  **Breathe:** Don't chain `git commit` immediately after a complex `replace_file_content` unless necessary.
    2.  **User Confirmation:** For major changes, let the user verify (and implicitly "Accept") the functionality before snapshotting.
    3.  **Advice to Students:** "Git is a camera. Don't take the photo while the subject is still getting dressed. Wait for the 'Accept' pose."

### M. The "Red Block" Panic (Conservation of Code)
**The Incident:**
The user hesitated to accept a change because they saw a massive block of Red (deleted) code, fearing they would lose features.
*   **The Reality:** The code wasn't being deleted; it was being *moved* to a different location in the file.
*   **The Lesson:**
    1.  **Don't Panic:** A big Red block is not always a deletion. It is often half of a "Cut & Paste" operation.
    2.  **Verify the Green:** Scroll down. If you see a Red Block, you *must* find a matching Green Block (Addition) of similar size elsewhere.
    3.  **The Rule:** `If (Red_Lines ~= Green_Lines) -> Safe Move.` `If (Red_Lines >> Green_Lines) -> DANGER (Reject).`

### N. The Human Safety Net (The Pilot's Burden)
**The Insight:**
As the Agent becomes more powerful, the Human's role doesn't disappear—it evolves into something harder. The Human is no longer just a "Coder," but a "System Guardian."
*   **The Reality:** AI can write code at 100mph, but it can also crash at 100mph.
*   **The Responsibility:**
    1.  **Context Awareness:** The AI only sees the file it's editing. The Human sees the *Project*, the *Goal*, and the *User*.
    2.  **The "Break Bad" Protocol:** When the Agent gets confused, deletes buttons, or hallucinates features, only the Human has the authority to say "STOP," reject the changes, and revert to safety.
    3.  **Conclusion:** We are not replacing the Human. We are giving the Human a faster car. They still have to drive it.

### O. The "Clean Slate" Protocol (Closing the IDE)
**The Question:**
"Should I keep the IDE open in the background, or close it completely?"
*   **The Answer:** **Close it completely.**
*   **The Lesson:**
    1.  **The Stress Test:** Closing the IDE is the ultimate test of your workflow. If you are afraid to close the window, it means you have "loose ends" (uncommitted code, temporary variables) that you are scared to lose.
    2.  **Commit Discipline:** You should be able to burn your computer, buy a new one, `git pull`, and resume work immediately.
    3.  **The Mantra:** "If it's not in Git, it doesn't exist." Don't rely on the IDE's "Undo" history as a backup. Commit your work, close the shop, and rest with a clear mind.

### P. The "Startup Script" Standard (PVE Automation)
**The Insight:**
We often waste time debugging "Module Not Found" errors because the terminal didn't activate the Virtual Environment (`.venv`) or we forgot to `cd` into the project root.

*   **The Problem:** Manual setup is fragile. Relying on memory to type `.\.venv\Scripts\activate` every morning is a recipe for frustration.
*   **The Solution:** **The `start_app.bat` Protocol.**
*   **The Lesson:**
    1.  **Automate the Boring:** As soon as an app has dependencies, create a one-click launcher (`start_app.bat` for Windows).
    2.  **Explicit Context:** The script must explicitly:
        *   `cd` to the project directory (`cd /d "%~dp0"`).
        *   Check for and activate the `.venv`.
        *   Launch the entry point (`python main.py`).
        *   Pause on error (so you can read the crash log).
    3.  **The Benefit:** It turns a "Developer Tool" into a "Product." You can pin this script to your Start Menu and treat your Python script like a real application.

### Q. The "Visual Cue" Trap (Terminal vs. Script)
**The Insight:**
Students are trained to look for `(.venv)` at the start of their command prompt. However, when running a batch script, this cue often disappears, causing panic.

*   **The Reality:** The `(.venv)` prefix is part of the *Interactive Shell Prompt*. When a script runs, it is not "interactive," so the prompt is not displayed. The environment IS active, but the label is hidden.
*   **The Fix:**
    1.  **Trust but Verify:** Use a diagnostic print (like `sys.executable`) to prove the environment is correct.
    2.  **Force the Visual:** In your startup script, manually set the Window Title or print a "Fake Prompt" to reassure the user.
    3.  **The Lesson:** "Absence of evidence is not evidence of absence." Just because you don't see the label doesn't mean the PVE isn't working. Check the logs.

### R. The Universal Startup Template
Here is the standard `start_app.bat` template. Copy this into any new project and just edit the `APP_NAME` and `ENTRY_POINT` at the top.

```batch
@echo off
:: ==================================================
:: CONFIGURATION
:: ==================================================
:: Auto-detect App Name from current directory folder name
for %%I in (.) do set APP_NAME=%%~nxI

:: Define the python script to run (Edit this line for new projects!)
set ENTRY_POINT=main.py
:: ==================================================

title %APP_NAME% (Initializing...)
echo Starting %APP_NAME%...
cd /d "%~dp0"

:: Check for Virtual Environment
if exist ".venv\Scripts\activate.bat" goto :found_venv
goto :no_venv

:found_venv
    call .venv\Scripts\activate.bat
    title %APP_NAME% (.venv)
    echo.
    echo  (.venv) %CD%
    echo.
    echo  [STATUS] PVE DETECTED and ACTIVATED.
    echo  [OK] Virtual Environment is ready.
    goto :run_app

:no_venv
    title %APP_NAME% (GLOBAL PYTHON)
    echo.
    echo  [STATUS] WARNING: PVE NOT FOUND.
    echo  [INFO] Attempting to run with global python...
    goto :run_app

:run_app
    echo.
    echo ==================================================
    echo DIAGNOSTIC: Verifying Python Interpreter...
    python -c "import sys; print(f'  >> Executable: {sys.executable}')"
    echo ==================================================
    echo.

    echo Running %ENTRY_POINT%...
    python %ENTRY_POINT%

    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo Application exited with error code %ERRORLEVEL%
    )
    echo.
    echo Press any key to close...
    pause >nul
```

### S. The "Multi-Instance" Trap (Ghost Windows)
**The Insight:**
You might see only one terminal window, but have 3 versions of your app running in the background. This happens frequently when testing with an Agent.

*   **The Cause:**
    1.  **Background Execution:** The Agent often runs commands in the "background" to keep the chat free. These processes don't always have a visible window.
    2.  **Orphaned Processes:** If you close a terminal window without properly exiting the script (Ctrl+C), the Python process might stay alive.
*   **The Risk:**
    1.  **File Conflicts:** Three apps trying to write to `data.json` at the same time = Data Corruption.
    2.  **Port Conflicts:** "Address already in use" errors if you are running a web server.
*   **The Fix:**
    1.  **Check the Taskbar:** Look for multiple Python icons or hidden windows.
    2.  **The "Kill Switch":** Use Task Manager to kill all `python.exe` processes.
    3.  **Agent Cleanup:** Explicitly ask the Agent: "Kill all running background tasks."

    **Nuance: The Power User Workflow (Intentional Parallelism)**
    *   **The Vision:** Once the code is stable, running multiple instances IS a feature. You might want one window for "LinkedIn" and another for "X" to work twice as fast.
    *   **The Constraint:** This requires the app to handle "Concurrency" (file locking) so two windows don't overwrite each other's saves.
    *   **The Rule:** Kill zombies during *Development*. Unleash the swarm during *Production*.

### T. The "Sync-Step" Protocol (Accept Before Proceeding)
**The Insight:**
When refactoring code in multiple steps (Phase 1, Phase 2...), a common failure mode is "Desynchronization."

*   **The Problem:**
    1.  Agent applies Phase 1 (creates `utils.py`, updates `main.py`).
    2.  User *reads* the chat but *forgets* to click "Accept" in the editor.
    3.  User asks for Phase 2.
    4.  Agent tries to edit `main.py` assuming Phase 1 is present.
    5.  **CRASH:** The Agent sees "Ghost Code" or the patch fails because line numbers don't match.
*   **The Rule:**
    *   **Agent:** MUST explicitly ask: "Please click Accept before we continue."
    *   **User:** MUST ensure the file is clean (no pending diffs) before giving the "Go Ahead."
    *   **Mantra:** "One Step, One Sync." Never queue up multiple complex refactors without syncing in between.

### U. The Git Safety Latch (Commit Protocol)
**The Insight:**
The Agent writes to the disk immediately. The "Accept" button is just a UI confirmation.
*   **The Danger:** If you run `git commit` *before* clicking "Accept," you are committing code you haven't technically "approved" in the UI.
*   **The Limitation:** The Agent CANNOT see if you clicked "Accept." It only sees the file on the disk.
*   **The Protocol:**
    1.  **Agent:** Before any commit, MUST run `git status` and list the modified files.
    2.  **Agent:** MUST ask: "I see changes in [Files]. Have you clicked 'Accept' on all of them?"
    3.  **User:** Must confirm "Yes" before the Agent runs `git commit`.
    4.  **Why:** This forces a "Human Checkpoint" to prevent accidental commits of unreviewed code.

### V. The TypeScript Trap (Strict Mode Fallacy)
**The Insight:**
Turning on `strict: true` in an existing codebase is a destructive act, not a refactor. It is a classic "Developer War Story."

#### 1. The "Big Bang" Fallacy
*   **What happens:** You turn on `strict` mode globally in `tsconfig.json` for a legacy project.
*   **The Result:** The compiler stops forgiving "loose" code.
    *   Variables that *could* be `null`? **Error.**
    *   Functions with `any` arguments? **Error.**
    *   Dynamic object keys? **Error.**
*   **The Lesson:** You cannot refactor a 2,000-line untyped application in one go. It’s like replacing the foundation of a house while people are living in it.

#### 2. The "Agent Trap"
*   **The Temptation:** "I have an AI Agent! I'll just tell it to 'Fix all errors'."
*   **The Reality:** When an Agent sees 500 red squiggly lines, it panic-fixes them.
    *   It adds `any` everywhere (defeating the purpose).
    *   It adds `!` (non-null assertions) causing runtime crashes.
    *   It hallucinates logic changes to satisfy the type checker.
*   **Result:** The code compiles, but the *logic* is destroyed.

#### 3. The Rules of Engagement
*   **A. The "Greenfield" Rule (New Projects):**
    *   **The Mandate:** Set `strict: true` in `tsconfig.json` **IMMEDIATELY** upon project creation.
    *   **The "AI Contract":** Strict typing is the most effective way to communicate intent to an AI.
        *   *Without Types:* The AI guesses what `data` is. It might guess wrong.
        *   *With Types:* The AI knows `data` has an `id` and a `value`. It cannot hallucinate fields that don't exist.
    *   **The Cost:** It costs almost nothing to write types *as you go*.
    *   **The Payoff:** It prevents the "Death by 1,000 Cuts" where the AI writes 90% correct code that fails in 10% of edge cases (nulls, undefineds).
    *   **Rule:** "If it's new, it must be strict."

### W. The Pydantic/Zod Alliance (Full-Stack Strictness)
**The Insight:**
Strict TypeScript is great, but it stops at the browser edge. If your Python backend sends garbage, your strict frontend crashes.

*   **The Solution:** Dual-Layer Defense.
    1.  **Backend (Python):** Use **Pydantic**. It is "Strict TypeScript for Python." It validates data *before* it leaves the server.
    2.  **Frontend (TypeScript):** Use **Zod**. It validates data *as* it enters the browser.
*   **The Rule:**
    *   **No Raw Dicts:** In Python, use `BaseModel`.
    *   **No `any`:** In TypeScript, use `z.infer`.
    *   **The Goal:** A continuous chain of custody for data integrity from the Database to the UI.
    
    *   **The Strictness Dividend (Examples of AI Guardrails):**
        1.  **The "Null" Trap:**
            *   *Loose:* AI writes `user.name.toUpperCase()`. Fails if user is null.
            *   *Strict:* Compiler forces AI to write `user?.name?.toUpperCase() ?? "GUEST"`.
        2.  **The "Typo" Trap:**
            *   *Loose:* AI writes `config.serverPort` (but the key is `server_port`). Runs fine, but port is undefined.
            *   *Strict:* Compiler screams "Property 'serverPort' does not exist on type 'Config'."
        3.  **The "Refactor" Trap:**
            *   *Loose:* You rename `User.id` to `User.uuid`. AI misses one usage in a helper file. Runtime crash.
            *   *Strict:* Compiler flags every single usage instantly.
        4.  **The "Magic String" Trap:**
            *   *Loose:* Function expects "admin" or "user". AI passes "Admin" (capital A). Fails silently.
            *   *Strict:* Type `Role = "admin" | "user"`. Compiler catches the typo immediately.
        5.  **The "Any" Hallucination:**
            *   *Loose:* AI assumes `response.data` is an Array. It's actually an Object. Code crashes on `.map()`.
            *   *Strict:* AI is forced to define `interface Response { data: Item[] }`. It *knows* the shape before writing logic.

*   **B. The "Brownfield" Rule (Existing Projects):**
    *   **NEVER** flip the global switch.
    *   Use **Incremental Strictness**. Pick ONE file, add `// @ts-check`, fix it, verify it, move on.

#### 4. The Verdict
*   **TypeScript is a Tool, not a Religion.**
*   For **Prototypes:** Loose typing is faster for iteration.
*   For **Production:** Strict typing is essential for stability.
*   **Don't sacrifice a working product for a "perfect" configuration.**













### X. The "Zombie Port" Protocol (Address Already in Use)
**The Incident:**
During development, the backend crashed, but the process didn't die completely. It became a "Zombie," holding onto Port 8000.
*   **The Symptom:** New server instances hang or crash immediately with "Address already in use."
*   **The Fix:**
    1.  **Kill the Zombies:** Use `taskkill /F /IM python.exe` (Windows) or `pkill python` (Mac/Linux) to clear the port.
    2.  **Change the Port:** If the port remains stuck, switch to a new port (e.g., 8001) to bypass the blockage entirely.
*   **The Lesson:** If a server isn't starting, check if it's *already* running in the shadows.
