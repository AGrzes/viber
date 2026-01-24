export type HostIdentity = {
  uid: number;
  gid: number;
};

export function getHostIdentity(): HostIdentity | null {
  if (typeof process.getuid !== "function" || typeof process.getgid !== "function") {
    return null;
  }

  return {
    uid: process.getuid(),
    gid: process.getgid(),
  };
}
