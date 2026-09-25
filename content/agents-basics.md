---
tags: [agents, tool-use]
---

# Agent Basics

An AI agent is a model that doesn't just answer in one shot — it plans, calls tools, observes results, and decides what to do next, often across multiple steps, until the task is done.

## What Makes Something an Agent

- **Tool use.** The model can call external functions (search, code execution, APIs, databases) rather than only generating text.
- - **Multi-step reasoning.** It breaks a goal into smaller steps and executes them in sequence, adjusting the plan as new information comes in.
  - - **Observation and feedback.** After each tool call, the model reads the result and decides the next action — this loop (act, observe, decide) is the core of agentic behavior.
    - - **Some degree of autonomy.** The agent decides which tools to use and when, rather than following a fixed script.
     
      - ## The Core Loop
     
      - 1. **Perceive** — read the current state: the user's goal, prior steps, tool outputs so far.
        2. 2. **Plan** — decide the next action (call a tool, ask a clarifying question, or produce a final answer).
           3. 3. **Act** — execute the chosen action (a tool call).
              4. 4. **Observe** — read the result of that action.
                 5. 5. Repeat until the goal is met or a stopping condition (error, max steps, explicit completion) is hit.
                   
                    6. ## Tool Design Matters
                   
                    7. An agent is only as good as the tools it can call. Good tool design means: clear names and descriptions (the model chooses tools based on these), tightly scoped inputs/outputs, predictable error messages the model can react to, and tools that map to one clear capability rather than a do-everything endpoint.
                   
                    8. ## Common Pitfalls
                   
                    9. - **Too much autonomy, too little oversight** — agents that can take irreversible actions (sending messages, deleting data, spending money) need explicit confirmation steps or hard guardrails.
                       - - **Ambiguous tool descriptions** — if two tools sound similar, the model will pick the wrong one inconsistently.
                         - - **No stopping condition** — agents can loop indefinitely without a clear notion of "done" or a max-step budget.
                           - - **Silent failures** — if a tool fails without a clear error, the agent may hallucinate a result instead of retrying or asking for help.
                            
                             - ## Single-Agent vs. Multi-Agent
                            
                             - A single agent with a good toolset is usually simpler to build, debug, and trust than a team of specialized sub-agents coordinating with each other. Multi-agent setups can help when subtasks require genuinely different context or tools, but they add coordination overhead and new failure modes (agents talking past each other, duplicated work). Start with one agent and split only when a single context window or tool set genuinely can't do the job.
                             - 
