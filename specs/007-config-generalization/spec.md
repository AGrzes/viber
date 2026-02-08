Refactor the viber cli simplifying approach to configuration management. 
Use concept of profile
- A json object that have all configurations
- May inherit from other profiles
- Inheritance is done by deep merge in order of inherited profiles then current profile configuration
Assume
- Global configuration defines a profiles object with a special `default` profile plus zero or more named profiles
- Project configuration may either inherit from default profile, a list of profiles (including default) or empty list (no inheritance)
Express all configuration in terms of profiles
Project configuration shape: the project config file itself is the current profile object with an optional `inherit` field.

Clarifications (iterative)
- The default workdir mount is applied in post-processing and is not expressed in profiles.
- There is no separate "image profile" concept. A profile that defines an image reference is the image selection.
- If inheritance is explicitly disabled (empty list), then all mandatory configuration (including image reference) must be defined locally; otherwise configuration is invalid.
- If `inherit` is omitted in a project config, it defaults to `[default]`. Explicit no-inheritance is `inherit: []`.
- Arrays are not merged. The most specific profile overrides inherited arrays.
- When merge semantics are desired, prefer associative maps/objects instead of arrays (e.g., `env: { A: B }` rather than `env: [{ key: "A", value: "B" }]`).
- Deletions in inherited maps use explicit `null` values (e.g., `env: { B: null }` removes `B`).
- Image profile is removed. Image selection is via `imageReference` in profiles, and normal deep-merge override semantics apply (child overrides parent).
