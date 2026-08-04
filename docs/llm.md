# grep.pdf — LLM

All model calls go through **LangChain's `ChatAnthropic`** — never the raw Anthropic SDK. This keeps prompt construction, model config, and structured-output parsing behind one interface. See [api.md](api.md) for how answers stream to the client and [database.md](database.md) for how retrieved chunks are scoped per user.

## Model selection

- Default model is **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`), chosen for speed and cost.
- The model is **overridable via env var** when a query needs higher quality — set it rather than hardcoding a model in call sites, so every chain picks up the change.

## Answer chain

The answer chain takes the **user question plus retrieved chunks** and produces a **cited answer**.

- Citations are **structured output**, not regex-matched from prose. Each citation carries a **page number** and **chunk id**.
- The structure is defined by a **Pydantic schema** and parsed via `ChatAnthropic`'s structured-output support — the model returns typed citations directly rather than the code scraping them from the answer text.

## Prompts

- Prompts live in `backend/app/services/llm/prompts` as **plain text files**.
- They are **loaded at startup**, not inlined in Python — edit the text files to change prompt wording without touching call sites.
