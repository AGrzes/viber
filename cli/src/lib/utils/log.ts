import debug from "debug";

export const log = {
  cli: debug("viber:cli"),
  config: debug("viber:config"),
  podman: debug("viber:podman"),
  session: debug("viber:session"),
};

export function enableDebug(namespaces: string): void {
  debug.enable(namespaces);
}
