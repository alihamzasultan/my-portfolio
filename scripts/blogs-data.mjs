/**
 * Long-form blog content for the portfolio.
 *
 * Each entry carries the fields the SEO layer needs: a canonical `slug`, a
 * `meta_description` for the <meta> tag and OG card, and an `image` used as the
 * social preview. Bodies use the extended markdown supported by lib/markdown.ts
 * (GFM tables, ```chart blocks, and a `## FAQ` section whose `###` questions are
 * lifted into FAQPage structured data).
 */

export const blogs = [
  // ---------------------------------------------------------------- 1
  {
    slug: 'reduce-livekit-voice-agent-latency',
    title: 'How I Cut LiveKit Voice Agent Latency to 330ms Building a Vapi Alternative',
    summary:
      'Two compounding turn-taking faults made our LiveKit agent slower the longer a call ran. Fixing endpointing and barge-in held response delay flat at 0.300s, and the same build runs about 5.5x cheaper per call than Vapi.',
    meta_description:
      'An AI automation engineer walks through diagnosing and fixing LiveKit voice agent latency: pinned endpointing, a two-word barge-in gate, 0.33s time-to-first-audio, and a per-minute cost breakdown against Vapi and Gemini Live.',
    published_date: '2026-07-30',
    updated_date: '2026-08-15',
    image: '/blog/livekit-latency.svg',
    tags: ['LiveKit', 'Voice AI', 'Latency', 'Deepgram', 'AI Engineer', 'SaaS'],
    content: `# How I Cut LiveKit Voice Agent Latency to 330ms Building a Vapi Alternative

We were building a voice-agent SaaS on **LiveKit**, the kind of product Vapi sells, and hit a problem that is easy to miss in a demo and impossible to miss on a real call: **the agent got slower the longer you talked to it.**

The first reply felt fine. By turn six there was an awkward beat before every response. By turn ten, callers were talking over it.

This post is the diagnosis, the fix, the measured result, and an honest account of **what I have not yet proven**.

## TL;DR

| Metric | Before | After |
| :--- | :--- | :--- |
| Endpointing delay | Climbed 300ms to ~3s over a call | Flat **0.300s** every turn |
| Time to first audio | Degraded with turn count | **0.33s** |
| False interruptions | Frequent (noise, echo) | None observed in test run (see note) |
| Cost per minute (excl. telephony) | n/a | **~$0.023** |
| Cost per 3-min call | ~$0.40 on Vapi | **~$0.07** (≈5.5x cheaper) |

Note: see [What I have not proven](#what-i-have-not-proven). That half of the result is not yet independently verified.

## The symptom: latency that compounds

The delay before the agent replied came from **two compounding faults** in how the worker configured turn-taking. Neither was fatal alone. Together they created a feedback loop.

### Fault 1: a second endpointing wait, set to "dynamic"

Deepgram Flux already determines *from the speech itself* when a caller has finished talking. That is the whole point of it. But the session was adding **a second wait on top of that decision**, and that wait was set to a "dynamic" mode.

Contrary to what the name suggests, that mode **only ever learns upward.** It raised the pause based on how long callers tended to hesitate, and it raised it again every time the agent was interrupted. Starting from the configured 300ms, it climbed toward a **3-second ceiling** as the call progressed.

\`\`\`chart
{"type":"bar","title":"Endpointing delay by turn (before fix)","unit":"ms","caption":"The dynamic mode ratchets upward and never recovers within a call.","data":[{"label":"Turn 1","value":300},{"label":"Turn 4","value":900},{"label":"Turn 7","value":1800},{"label":"Turn 10","value":2600},{"label":"Ceiling","value":3000}]}
\`\`\`

### Fault 2: barge-in driven by raw VAD

Interruption was driven by **raw voice-activity detection** with no noise suppression and no check against the transcript. That meant:

- Line noise could stop the agent mid-sentence.
- Background sound could stop it.
- **The agent's own voice echoing back** could stop it.

And here is the loop: **each false interruption fed the endpointing filter**, which raised the pause, which made the next reply slower. The two faults reinforced each other. That is why calls degraded the longer they ran, and why the bug looked intermittent in short tests.

> The failure mode was not "latency is high." It was "latency is a function of how long the call has been going." Those need completely different fixes.

## The fix

Two changes, both small:

**1. Pin endpointing.** We removed the dynamic mode and pinned the delay to a fixed **300ms floor** with an explicit **1.5-second ceiling**. Flux's own decision is the signal; the extra wait is a safety margin, not a learner.

**2. Gate barge-in on words, not energy.** The agent now requires **two recognised words** before it can be interrupted. Noise that transcribes to nothing can no longer cut it off.

\`\`\`python
# Endpointing: fixed floor, explicit ceiling, no upward adaptation
endpointing_delay_ms   = 300
endpointing_max_ms     = 1500

# Barge-in: require real words, not raw energy
min_interruption_words = 2
\`\`\`

### Measured result

Across a test session the endpointing delay **held flat at 0.300s on every turn** instead of climbing, with **time-to-first-audio at 0.33s**.

\`\`\`chart
{"type":"bar","title":"Endpointing delay by turn (after fix)","unit":"ms","caption":"Pinned floor. The value no longer depends on how long the call has run.","data":[{"label":"Turn 1","value":300},{"label":"Turn 4","value":300},{"label":"Turn 7","value":300},{"label":"Turn 10","value":300}]}
\`\`\`

## What this costs to run

Our pipeline is **Deepgram Flux** for speech-to-text, **Gemini 2.5 Flash** for the conversation, and **Deepgram Aura-2** for the voice. It runs at roughly **$0.023 per minute excluding telephony**, about **$0.07 for a three-minute call**.

The split is the interesting part:

\`\`\`chart
{"type":"bar","title":"Share of per-minute cost by component","unit":"%","caption":"The conversation model is a rounding error. The voice is the bill.","data":[{"label":"Text-to-speech","value":65},{"label":"Speech-to-text","value":27},{"label":"Language model","value":8}]}
\`\`\`

**Text-to-speech accounts for around 65% of the cost and the language model for under 8%.** The practical consequence: agonising over which conversation engine to use barely moves the bill. The voice is where the money is.

The largest remaining saving is not the model, it is moving from **Aura-2 to Aura-1**, which halves the text-to-speech line and removes roughly **a third of the total per-minute cost**.

## Comparison: our stack vs Gemini Live vs Vapi

| | Our stack | Gemini Live | Vapi |
| :--- | :--- | :--- | :--- |
| Per-minute (3-min call) | **~$0.023** | ~$0.03 | ~$0.13 |
| Per-minute (10-min call) | **~$0.023** (flat) | ~$0.078† | ~$0.13 |
| Scales with | Call length | **Turn count** | Call length |
| Platform fee | None | None | **$0.05/min** |
| Audio channels transcribed | 1 | 1 | **2** |
| 3-min call, all-in | **~$0.07** | n/a | **~$0.40** |

Figures marked with a dagger are modelled, not published. See the caveat below.

### Why Gemini Live looks cheaper than it is

Gemini Live, the speech-to-speech alternative, **appears cheaper when priced on duration alone**. But Google confirms it **re-bills the entire accumulated conversation context on every turn**. Its cost therefore scales with **turn count**, not call length.

Modelled out: approximately **$0.044/min on a five-minute call** and **$0.078/min on a ten-minute one**, while ours stays flat at any length.

### Why Vapi costs what it costs

Vapi charges a **$0.05/min platform fee on top of provider costs**, and it **transcribes both audio channels rather than one**. A real three-minute call billed at approximately **$0.40 on Vapi against $0.07 on our stack, around 5.5x cheaper.**

That is not a knock on Vapi. You are paying for orchestration you would otherwise build. The question is whether your volume makes building it worthwhile.

## What I have not proven

Two things to keep in mind before this goes in front of a client. I would rather state these plainly than have someone discover them later.

**1. The endpointing result is measured; the interruption fix is not yet independently proven.**

That test session ran the worker in **dev mode**, which activated the SDK's adaptive interruption detector, something production does not use. So the zero false-interruptions in that run **cannot be attributed solely to our \`min_words\` change**. It also ran over a clean browser microphone, not the **8kHz phone line** where the cut-offs were worst. A start-mode run on a real call would let me state the second half as confidently as the first.

**2. The Gemini Live per-minute figures are modelled, not published.**

The underlying rates and the re-billing mechanism are sourced, but the **$0.044 and $0.078 are my arithmetic on top of them**. Fine for an internal comparison; I would soften them to *"roughly double, and rising with call length"* in anything contractual.

## FAQ

### What causes increasing latency in LiveKit voice agents?

Most often a second endpointing wait stacked on top of the speech-to-text engine's own end-of-turn decision. If that wait is set to an adaptive mode that only adjusts upward, it ratchets higher with every hesitation and every interruption, so response delay grows over the course of a call rather than staying constant.

### What is a good time-to-first-audio for a voice agent?

Under 500ms feels conversational; above roughly 800ms callers start talking over the agent. We measure 0.33s time-to-first-audio with endpointing pinned at 300ms. The number that matters is not the average but whether it stays stable across a long call.

### Why does my voice agent interrupt itself?

Because barge-in is being driven by raw voice-activity detection rather than the transcript. Without noise suppression and a word-count gate, line noise, background sound, and the agent's own echo all register as speech. Requiring two recognised words before an interruption is allowed removes that class of failure.

### Is building on LiveKit cheaper than using Vapi?

On raw per-call cost, yes, roughly 5.5x in our measurements, about $0.07 versus $0.40 for a three-minute call, because Vapi adds a $0.05/min platform fee and transcribes both audio channels. That ignores engineering time. Vapi is selling orchestration; whether building it yourself pays depends on your call volume.

### Which part of a voice pipeline costs the most?

Text-to-speech, by a wide margin, around 65% of our per-minute cost, against under 8% for the language model. Engineers habitually optimise the LLM because that is the interesting part, but switching the voice model is what actually moves the invoice.

### Does Gemini Live cost more than a composed pipeline?

It depends on call shape. Priced per minute of duration it looks competitive, but it re-bills the whole conversation context each turn, so cost scales with turn count. On longer, chattier calls a composed speech-to-text plus LLM plus text-to-speech pipeline stays flat while Gemini Live climbs.

## Takeaway

The lesson generalises past voice: **when a system degrades over time rather than failing outright, look for a feedback loop, not a slow component.** We spent days profiling inference before noticing that latency correlated with call duration, and that single observation pointed straight at both faults.

If you are building agentic or voice AI systems and want to compare notes on turn-taking, I am reachable through the contact section on this site.`,
  },

  // ---------------------------------------------------------------- 2
  {
    slug: 'ai-voice-agents-that-book-appointments',
    title: 'Shipping AI Voice Agents That Actually Book Appointments',
    summary:
      'What separates a voice agent demo from one that survives real callers: conversation state that outlives the call, webhooks allowed to fail, and knowing when to hand off to a human.',
    meta_description:
      'A production guide to building AI voice agents that book, reschedule, and cancel appointments, covering conversation memory, idempotent webhooks, latency budgets, and escalation, from an AI automation engineer.',
    published_date: '2026-06-18',
    updated_date: '2026-08-15',
    image: '/blog/voice-agents.svg',
    tags: ['Voice AI', 'Vapi', 'ElevenLabs', 'Twilio', 'AI Automation Engineer'],
    content: `# Shipping AI Voice Agents That Actually Book Appointments

A voice agent that answers questions is a demo. A voice agent that **books, reschedules, and cancels appointments**, and remembers you called last week, is a product.

The gap between the two is mostly unglamorous engineering. Here is what it consists of.

## The three things demos skip

### 1. State that outlives the call

Most tutorials treat each call as a blank slate. Real callers hang up mid-flow, call back twice, and expect to be remembered. Before the model generates a single token, look the caller up by phone number and inject what you know:

\`\`\`json
{
  "caller": "+1555...",
  "last_call": "2026-06-02",
  "open_appointment": "2026-06-20T14:00:00Z",
  "notes": "Prefers afternoons. Asked about pricing."
}
\`\`\`

That block costs almost nothing in tokens and eliminates the most common complaint about voice agents: being treated like a stranger by a system you spoke to yesterday.

### 2. Webhooks that are allowed to fail

Booking is a side effect on someone else's system, and that system will be down at some point. **Never let the model narrate a booking it has not confirmed.** The order matters:

1. Model proposes a slot.
2. Webhook attempts the write.
3. Only after a success response does the agent say "you're booked."

If the webhook fails, the agent offers a callback rather than inventing a confirmation number. An agent that lies once is an agent nobody trusts again.

### 3. Knowing when to stop

Set a hard turn limit and an explicit escalation path. A caller looping three times on the same question is not a prompt-engineering problem to solve live, it is a human handoff.

## Latency is the whole experience

Callers forgive a wrong answer faster than a two-second silence. Practical wins, in the order I reach for them:

| Fix | Typical saving | Effort |
| :--- | :--- | :--- |
| Stream TTS instead of awaiting the full response | 400–800ms | Low |
| Keep the system prompt short and cached | 100–300ms | Low |
| Pre-warm the function-call schema | 50–150ms | Medium |
| Filler phrase while a webhook runs | *feels* instant | Low |

\`\`\`chart
{"type":"bar","title":"Where a 1.4s response budget goes","unit":"ms","caption":"Streaming the voice output is the single largest lever.","data":[{"label":"Speech-to-text","value":180},{"label":"LLM first token","value":320},{"label":"Tool / webhook call","value":480},{"label":"TTS first audio","value":420}]}
\`\`\`

That last row in the table is not a real saving, but "let me check that for you" while the CRM call is in flight buys a full second of goodwill.

## A realistic booking flow

\`\`\`
caller speaks
  -> transcript
  -> intent: reschedule
  -> lookup existing appointment      [webhook, may fail]
  -> propose 3 slots
  -> caller picks one
  -> write booking                    [webhook, must confirm]
  -> confirm aloud ONLY on success
  -> sync to CRM                      [async, retryable]
\`\`\`

Note that the CRM sync is **after** the confirmation and is allowed to be asynchronous. The caller should never wait on your analytics pipeline.

## FAQ

### How do you give an AI voice agent memory between calls?

Look the caller up by phone number before generating the first response and inject a compact JSON summary, last call date, open appointments, stated preferences, into the system context. It costs very few tokens and removes the single most common source of caller frustration.

### Should the agent confirm a booking before the webhook returns?

No. Confirm only after the booking system returns success. If you confirm optimistically and the write fails, the caller believes they have an appointment that does not exist, which is worse than any delay.

### What is an acceptable response latency for a voice agent?

Aim for under 800ms from end of caller speech to first audio out. Past roughly one second, callers assume the line dropped and start talking again, which triggers interruption handling and compounds the problem.

### When should a voice agent hand off to a human?

Set a hard turn cap and escalate on repetition. If a caller asks substantially the same question three times, additional model turns rarely help, route to a human and pass the transcript along so the caller does not repeat themselves.

## Takeaway

Build the boring parts first. The prompt is perhaps 20% of the work; the other 80% is state, retries, and deciding what the agent does when the world does not cooperate.`,
  },

  // ---------------------------------------------------------------- 3
  {
    slug: 'multi-agent-rag-pipeline-n8n',
    title: 'A 6-Agent RAG Pipeline in n8n That Writes 35-Day Course Scripts',
    summary:
      'Splitting one overloaded prompt into six narrow agents made the output better, roughly half the cost, and far easier to debug. Here is the architecture and the validator that earns its keep.',
    meta_description:
      'How to design a multi-agent Retrieval-Augmented Generation pipeline in n8n using Claude 3.5 Sonnet and a Supabase vector store, agent decomposition, per-day retrieval, validation loops, and cost routing.',
    published_date: '2026-04-27',
    updated_date: '2026-08-15',
    image: '/blog/multi-agent-rag.svg',
    tags: ['RAG', 'n8n', 'Multi-Agent', 'Claude', 'Supabase', 'AI Engineer'],
    content: `# A 6-Agent RAG Pipeline in n8n That Writes 35-Day Course Scripts

I started with one prompt that did everything. It worked about **60% of the time**, and when it failed there was no way to tell *which part* had failed.

Splitting it into six agents fixed both problems.

## The pipeline

\`\`\`
Topic Selector -> Context Retriever -> Outline Agent
                                          |
                                          v
Formatter <- Validator <-------------- Draft Writer
                 |                        ^
                 +------- rejects --------+
\`\`\`

Each agent has one job and a schema it must return. That constraint is what makes the system debuggable.

## Why narrow agents win

| | Single mega-prompt | Six narrow agents |
| :--- | :--- | :--- |
| Success rate | ~60% | ~94% |
| Failure localisation | Read 4,000 tokens | Schema violation names the stage |
| Retry cost | Whole course | One day |
| Model routing | One tier for everything | Cheap stages on cheap models |
| Relative cost | 1.0x | **~0.5x** |

**Failures become locatable.** When output is wrong, the schema violation tells you which stage broke.

**Cheap models handle cheap stages.** The formatter does not need Claude 3.5 Sonnet, it needs to turn valid JSON into markdown. Routing stages by difficulty cut per-course cost by roughly half.

**Retries are surgical.** The validator rejecting day 14 re-runs day 14, not all 35 days.

## Retrieval is the part people get wrong

The Supabase vector store is **not** queried once at the top. It is queried **per day**, using that day's specific learning objective as the query, not the course topic.

Retrieving against "Introduction to Machine Learning" returns the same five chunks 35 times. Retrieving against *"day 14: regularisation and overfitting"* returns something useful.

\`\`\`sql
select content, 1 - (embedding <=> query_embedding) as similarity
from course_chunks
where 1 - (embedding <=> query_embedding) > 0.78
order by similarity desc
limit 6;
\`\`\`

That **similarity floor matters**. Without it you retrieve six chunks no matter what, including when the correct answer is that nothing relevant exists.

\`\`\`chart
{"type":"bar","title":"Retrieval quality by query strategy","unit":"% useful chunks","caption":"Per-day objective queries dramatically outperform a single topic-level query.","data":[{"label":"Topic-level query","value":31},{"label":"Section-level query","value":58},{"label":"Per-day objective","value":86}]}
\`\`\`

## The validator earns its keep

It checks three things, strictly:

1. Does every day have a stated objective?
2. Does day N reference only concepts introduced on days 1..N-1?
3. Is the script within the target length band?

**Rule 2 catches the real problems.** Language models love to casually mention gradient descent on day 3 and then formally introduce it on day 19.

## FAQ

### When should you split one prompt into multiple agents?

When you cannot tell which part of the output failed. If a single prompt produces several distinct artefacts, an outline, a draft, formatting, and a bad result forces you to re-read the whole prompt to find the cause, that is the signal to decompose.

### How do you stop a RAG pipeline retrieving irrelevant context?

Set a similarity floor and return nothing when it is not met. Fixed top-k retrieval always returns k chunks, so when no relevant content exists the model receives noise and treats it as authoritative.

### Does multi-agent orchestration cost more than a single prompt?

Not necessarily. It costs more calls but lets you route each stage to an appropriate model tier. Moving deterministic stages such as formatting onto cheaper models roughly halved our per-course cost versus running everything on a frontier model.

### What should a validation agent check?

Structural invariants a model cannot self-assess reliably: required fields present, no forward references to concepts not yet introduced, and length within band. Keep validation deterministic where possible and reserve model judgement for genuinely fuzzy criteria.

## Takeaway

Manual research and writing effort dropped substantially, but the honest headline is different: the output became **predictable**. Predictable is worth more than fast.`,
  },

  // ---------------------------------------------------------------- 4
  {
    slug: 'seo-for-ai-generated-content',
    title: 'Making AI-Generated Articles Crawlable by Googlebot and LLM Bots',
    summary:
      'Auto-publishing is solved. Getting the result indexed by search engines and quoted by AI answer engines takes server rendering, structured data, and semantic HTML that most generated pages skip.',
    meta_description:
      'A technical SEO guide for AI-generated content pipelines: server-side rendering in Next.js, JSON-LD structured data, semantic HTML, robots.txt for GPTBot and Googlebot, and why thin automated pages fail to rank.',
    published_date: '2026-03-09',
    updated_date: '2026-08-15',
    image: '/blog/seo-ai-content.svg',
    tags: ['SEO', 'Content Automation', 'Next.js', 'Structured Data', 'AI'],
    content: `# Making AI-Generated Articles Crawlable by Googlebot and LLM Bots

Auto-publishing articles is a solved problem. Getting them **seen**, by Google and by the growing set of LLM crawlers, is where most content pipelines quietly fail.

## Render on the server, always

If your article body arrives via a client-side fetch, you have built a page that many crawlers see as **empty**. Googlebot renders JavaScript, but on a delay and a budget. Most LLM crawlers do not render it at all.

\`\`\`tsx
export const revalidate = 3600

export default async function Article({ params }) {
  const post = await getPost(params.slug)   // runs on the server
  return <article dangerouslySetInnerHTML={{ __html: post.html }} />
}
\`\`\`

**View source. If you cannot read the article text there, no crawler can either.**

## Crawler behaviour differs more than people assume

| Crawler | Executes JS | Reads JSON-LD | Honours robots.txt |
| :--- | :--- | :--- | :--- |
| Googlebot | Yes (deferred) | Yes | Yes |
| Bingbot | Yes (limited) | Yes | Yes |
| GPTBot | **No** | Partially | Yes |
| ClaudeBot | **No** | Partially | Yes |
| PerplexityBot | Limited | Yes | Yes |

The column that matters is the second one. **Client-rendered content is invisible to most AI crawlers.**

## Structured data is how you get quoted

JSON-LD tells a machine what the page *is* rather than making it infer:

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "...",
  "datePublished": "2026-03-09",
  "author": { "@type": "Person", "name": "Ali Hamza Sultan" }
}
\`\`\`

Adding a \`FAQPage\` block for a question section is disproportionately valuable, it is the format answer engines most readily lift.

## Semantic HTML beats styled divs

An LLM crawler reconstructs meaning from tags. A page built from \`<div>\` soup with visual-only hierarchy reads as one undifferentiated block. Real \`<h2>\`, real \`<ul>\`, real \`<table>\` carry the outline that makes an article summarisable.

**One \`<h1>\` per page.** This is the rule most auto-generated pages break, usually by templating a site title as \`<h1>\` and then the article title as another.

\`\`\`chart
{"type":"bar","title":"Indexation rate by rendering strategy","unit":"% indexed in 30d","caption":"Observed across a batch of auto-published articles.","data":[{"label":"Client-rendered","value":34},{"label":"SSR, no schema","value":71},{"label":"SSR + JSON-LD","value":93}]}
\`\`\`

## Do not accidentally block the bots

\`\`\`
User-agent: GPTBot
Allow: /blogs/

User-agent: Googlebot
Allow: /
\`\`\`

Whether you *want* GPTBot is a business decision. Making that decision by accident, via a copy-pasted robots.txt, is not.

## FAQ

### Does Google index client-side rendered content?

Eventually, often. Googlebot renders JavaScript but defers it to a second pass with a limited budget, so client-rendered pages index slower and less reliably. Most non-Google AI crawlers do not execute JavaScript at all, so client rendering makes content invisible to them.

### What structured data should a blog post include?

At minimum BlogPosting with headline, datePublished, dateModified, and author. Add BreadcrumbList for hierarchy and FAQPage when the article contains a question section, FAQ markup is the format answer engines most readily quote.

### Should I block GPTBot and other AI crawlers?

That is a business decision, not a technical one. Blocking protects content from training use; allowing makes you eligible to be cited in AI answers. The mistake is making the choice unintentionally by copying someone else's robots.txt.

### Why do AI-generated articles fail to rank?

Usually because they are thin, restating what already exists without new data. Pipelines that publish at scale without a live data source produce pages that get filtered rather than ranked. Wire the generator to real numbers, or do not publish.

## Takeaway

A pipeline that publishes thin articles at scale produces **thin articles at scale**. Real-time data, actual numbers, actual dates, things that were true this week, separates a page worth indexing from one that gets filtered.`,
  },

  // ---------------------------------------------------------------- 5
  {
    slug: 'crm-automation-webhooks',
    title: 'Webhooks Are the Hard Part of CRM Automation',
    summary:
      'Every CRM has a clean REST API and a tidy quickstart. None of that is the hard part. The hard part is that webhooks fire twice, arrive out of order, and carry fields your CRM has never heard of.',
    meta_description:
      'Production patterns for syncing AI voice agent and lead data into HubSpot, Pipedrive, and GoHighLevel: idempotent upserts, out-of-order event handling, field mapping, and payload logging.',
    published_date: '2026-01-22',
    updated_date: '2026-08-15',
    image: '/blog/crm-webhooks.svg',
    tags: ['Automation', 'HubSpot', 'Pipedrive', 'n8n', 'GoHighLevel', 'AI Automation'],
    content: `# Webhooks Are the Hard Part of CRM Automation

Every CRM has a clean REST API and a tidy quickstart. **None of that is the hard part.**

The hard part is that webhooks fire more than once, arrive out of order, and carry fields your CRM has never heard of.

## Assume every webhook fires twice

It will. A retry after a timeout, a platform hiccup, a user double-clicking. If your handler creates a contact on every call, you now have duplicate contacts and a sales team that does not trust the system.

Make writes idempotent with a stable key:

\`\`\`js
await hubspot.upsert({
  idProperty: 'phone',        // stable, not a generated id
  properties: { phone, firstname, lifecyclestage }
})
\`\`\`

Where a true upsert is unavailable, keep a short-lived cache of processed event ids and drop repeats.

## Out-of-order delivery is normal

Two events fired 200ms apart can land in reverse order. If one sets status to \`qualified\` and the other to \`contacted\`, whichever lands last wins, and that may be the wrong one.

Carry a timestamp in the payload and **refuse to apply an update older than what is already stored**. It is a handful of lines and it prevents an entire category of "the CRM keeps reverting" bug reports.

## Failure modes, ranked by how often they bite

| Failure | Frequency | Fix | Effort |
| :--- | :--- | :--- | :--- |
| Duplicate events | Very high | Idempotent upsert on stable key | Low |
| Out-of-order updates | High | Timestamp guard | Low |
| Unmapped field | High | Central mapping table | Medium |
| Silent auth expiry | Medium | Alert on 401, not just retry | Low |
| Rate limiting | Medium | Queue with backoff | Medium |

## Field mapping deserves its own file

Voice agents produce messy, human-shaped data: *"tomorrow afternoon"*, *"the bigger package"*, *"Ali, that's A-L-I"*. CRMs want enums and ISO timestamps.

Keep the translation in one explicit place:

| Agent output | CRM field | Transform |
| :--- | :--- | :--- |
| "tomorrow afternoon" | \`preferred_slot\` | Resolve against caller timezone |
| "bigger package" | \`deal_tier\` | Fuzzy match to enum |
| "interested" | \`lifecyclestage\` | Map to \`opportunity\` |

Scattering these conversions across workflow nodes means that the day the CRM adds a required field, you go hunting.

## Log the payload, not just the error

When a sync fails at 2am, the stack trace tells you **what** broke. The raw payload tells you **why**. Store it, with PII handled appropriately, and failures stop being archaeology.

## FAQ

### How do you prevent duplicate contacts from webhook retries?

Use an idempotent upsert keyed on something stable such as phone or email rather than a generated id. Where the CRM has no upsert, keep a short-lived cache of processed event ids and drop repeats before writing.

### Why does my CRM keep reverting a contact's status?

Almost always out-of-order webhook delivery. Two updates sent milliseconds apart can arrive reversed, so an older status overwrites a newer one. Include a timestamp in the payload and reject updates older than the stored value.

### Where should data transformation live in an automation pipeline?

In one central mapping definition rather than spread across workflow nodes. Voice and form inputs are messy while CRMs expect enums and ISO timestamps, and centralising that translation means schema changes are a single edit.

### What should you log when a CRM sync fails?

The full inbound payload alongside the error. The stack trace tells you what broke; only the payload tells you why. Retain it with appropriate PII handling so failures can be diagnosed after the fact.

## What good looks like

A caller finishes a conversation. Within two seconds the contact exists in HubSpot, the deal sits on the right pipeline stage, the follow-up SMS is queued in GoHighLevel, and **nothing is duplicated if the webhook fires again**.

That is the whole job, and almost none of it is the API call.`,
  },
]

export default blogs
