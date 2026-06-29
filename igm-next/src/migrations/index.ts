export const migrations: Array<{
  up: () => Promise<void> | void;
  down: () => Promise<void> | void;
  name: string;
}> = [];
