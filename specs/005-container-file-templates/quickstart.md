# Quickstart: Container File Templates

1. Define templates in your project config (e.g., `.specify.local.json` or similar):
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
2. Merge with the global config (if any) by keeping shared templates in `.specify.global.json`; local entries deep-merge when names match.
3. Run the CLI, passing `--suppress agent-config` if you need to skip any template for this invocation.
4. The CLI renders each remaining template, writes it to a temporary file, resolves `${ENV}` using current environment variables, and mounts the file into the container at the resolved path.
5. Confirm the file exists inside the container and matches the rendered content; the CLI prints logs for generated temp paths and mounts.
