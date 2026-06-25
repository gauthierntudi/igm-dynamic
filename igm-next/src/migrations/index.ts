import * as migration_20260624_005240_who_we_are from './20260624_005240_who_we_are';

export const migrations = [
  {
    up: migration_20260624_005240_who_we_are.up,
    down: migration_20260624_005240_who_we_are.down,
    name: '20260624_005240_who_we_are'
  },
];
