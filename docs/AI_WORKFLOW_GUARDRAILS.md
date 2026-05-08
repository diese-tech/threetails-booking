# AI Workflow Guardrails

Review this document before implementation, debugging, refactoring, migrations, or production fixes in this repository.

## Core Rule

Move fast, but move surgically. Prefer the smallest safe change that solves the measured problem. Avoid broad rewrites, speculative refactors, or unrelated cleanup.

## Repo-Specific Focus

- Preserve booking concurrency and reservation integrity.
- Isolate customer and session state.
- Keep payment, discount, and reservation flows safe and easy to roll back.
- Minimize blast radius around booking logic.
- Use caching and efficient queries where traffic can spike.
- Avoid synchronous fan-out during reservation activity.
- Handle customer data carefully.
- Degrade gracefully during traffic spikes or external service failures.

## Required Before Changing Code

- Identify the specific problem and files likely involved.
- Name the expected impact and rollback path.
- Check whether the change affects booking availability, reservations, payments, customer data, email delivery, data integrity, or production operations.
- Avoid touching unrelated files.

## Architecture Defaults

- Prefer queue-based async processing over synchronous fan-out.
- Prefer append-only booking events or audit records where useful.
- Prefer indexed availability and reservation lookups over raw scans.
- Prefer bounded concurrency, batching, and backoff.
- Prefer idempotent and retry-safe jobs.
- Keep public booking flows isolated from expensive backend work.

## Change Review Checklist

Before finalizing a change, answer what changed, why it is safe, what could break, how to roll back, and what validation proves the change.
