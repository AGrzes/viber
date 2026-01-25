# Quickstart: Container File Templates

1. Define templates in your project config (e.g., `.viber.json` or another local config file). Add a `templates` array alongside the other fields:
   ```json
   {
     "templates": [
       {
         "name": "agent-config",
         "path": "/app/config/${ENV}.json",
         "template": "{\"env\": \"{{env}}\"}",
         "parameters": { "env": "staging" }
       }
     ]
   }
   ```
2. Merge with the global config (if any) by keeping shared templates in `.specify.global.json`; local entries deep-merge when names match. Each entry must provide:
   - `name` (unique identifier)
   - `path` (container path that may include `${ENV}` placeholders)
   - `template` (Handlebars template string)
   - `parameters` (object passed to Handlebars; nested maps are merged)
3. Run the CLI, passing `--suppress agent-config` if you need to skip any template for this invocation. You can repeat `--suppress` to skip multiple names.
4. The CLI renders each remaining template, writes it to a temporary file, resolves `${ENV}` (or other placeholders) using the session environment values, and mounts the file into the container at the resolved path.
5. Confirm the file exists inside the container and matches the rendered content; the CLI prints logs for generated temp paths and mounts.
