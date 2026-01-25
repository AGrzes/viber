# Research Notes: Container File Templates

## Decision: Use existing CLI environment + Handlebars for rendering

**Rationale**: The CLI already runs on Node/TypeScript and can reuse dependable packages; Handlebars keeps templating deterministic and supports nested parameters. No external template engine better matches the config-driven requirement.

**Alternatives considered**: Writing custom string interpolation (rejected due to maintenance) and adopting a heavyweight generator (too large for simple config merging).

## Decision: Define performance goal as sub-5-second preparation window

**Rationale**: Templates are rendered during container prep and should not block the start; 5 seconds for up to 20 templates keeps setup responsive without stressing the existing CLI run cadence.

**Alternatives considered**: No explicit target (default) was insufficient because acceptance tests expect timing bounds; larger budgets (e.g., 30 seconds) unnecessarily increase failure surface.

## Decision: Constraints focus on transient temp files and mount policies

**Rationale**: Storing files temporarily and mounting them per run matches container workflows and avoids introducing new persistence concerns.

**Alternatives considered**: Persisting generated files permanently (rejected because cleanup responsibility and scope creep) and bundling templates in the image (not configurable at runtime).
