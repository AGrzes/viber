# Quickstart: Env Mapping Management

## Create or update mappings

- Set global mapping:
  - `viber env set --global KEY=value`
- Set project mapping:
  - `viber env set KEY=value`

## List mappings

- Global: `viber env list --global`
- Project: `viber env list`

## Get a mapping

- Global: `viber env get --global KEY`
- Project: `viber env get KEY`

## Delete a mapping

- Global: `viber env delete --global KEY`
- Project: `viber env delete KEY`

## Notes

- Project scope requires an existing project config in the current or parent directory.
- Project mappings override global mappings during session startup.
- Mapping values may include host interpolation like `E1=$HOST_VAR`.
