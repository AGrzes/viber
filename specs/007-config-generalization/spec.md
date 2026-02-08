Refactor the viber cli simplifying approach to configuration management. 
Use concept of profile
- A json object that have all configurations
- May inherit from other profiles
- Inheritance is done by deep merge in order of inherited profiles then current profile configuration
  (left-to-right, later inherited profiles override earlier ones; current profile overrides all inherited results).
Assume
- Global configuration defines a profiles object with a special `default` profile plus zero or more named profiles
- Project configuration may either inherit from default profile, a list of profiles (including default) or empty list (no inheritance)
Express all configuration in terms of profiles
Project configuration shape: the project config file itself is the current profile object with an optional `inherit` field.
`inherit` supports only global profile names. Project configs do not define inline inherited profiles.
- Inheritance cycles are not allowed; detect and throw a hard error during config load/merge.
- Referencing a non-existent global profile name in `inherit` is a hard error.
- `inherit` is a control field and is stripped before merge; it does not appear in resolved profiles.
- No special interpolation or project-specific substitution occurs during profile merge; resolve the final config first, then pass to runtime.

Clarifications (iterative)
- The default workdir mount is applied in post-processing and is not expressed in profiles.
- Workdir mapping is always applied and cannot be disabled via profiles.
- There is no separate "image profile" concept. A profile that defines an image reference is the image selection.
- If inheritance is explicitly disabled (empty list), then all mandatory configuration (including image reference) must be defined locally; otherwise configuration is invalid.
- If `inherit` is omitted in a project config, it defaults to `[default]`. Explicit no-inheritance is `inherit: []`.
- If `inherit` is omitted and no global `default` profile exists, treat it as no inheritance (no error).
- Global profiles support the same inheritance behavior as project profiles, including defaulting to `[default]` when `inherit` is omitted (unless no `default` exists).
- The implicit `[default]` inheritance is not applied when resolving the `default` profile itself to avoid self-cycles. Explicit `inherit: ["default"]` on `default` is an error (cycle).
- Arrays are not merged. The most specific profile overrides inherited arrays.
- When merge semantics are desired, prefer associative maps/objects instead of arrays (e.g., `env: { A: B }` rather than `env: [{ key: "A", value: "B" }]`).
- Deletions in inherited maps use explicit `null` values (e.g., `env: { B: null }` removes `B`).
- Nulls are allowed for deletions, but the final resolved profile must pass validation; if required fields are missing or null after merge, configuration is invalid.
- Image profile is removed. Image selection is via `imageReference` in profiles, and normal deep-merge override semantics apply (child overrides parent).
- `agentsRef` is removed. Agent selection is handled via profile content and inheritance; profiles carry `agents` map entries (e.g., `agents: { default: "..." }`).
- `agents` uses the same map model in both global and project profiles; it participates in deep-merge with null deletions.
- CLI-level agent selection flags are removed; agent behavior is handled via profiles.
- Field renames for profile-shaped config:
  - `imageReference` -> `image`
  - `envMappings` -> `env`
  - `volumeMappings` -> `volumes`
  - `templates` remains `templates`
