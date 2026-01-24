import debug from "debug";

export const log = {
  cli: debug("viber:cli"),
  config: debug("viber:config"),
  podman: debug("viber:podman"),
};

export function enableDebug(namespaces: string): void {
  debug.enable(namespaces);
}
