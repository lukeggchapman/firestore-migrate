# Firestore-migrate

Migration tool for firestore data that supports typescript migrations.

Very basic design, use at your own risk!

## Installation

```
npm install firestore-migrate
```

## Usage

There are two ways to use this tool.

- As a commandline tool.
- Calling migrate programmatically.

Creates a new Document at `config/migration` to track the version of the datastore.

### Command line

#### create

Creates a new firestore migration file with filename `<version>__<name>.ts`.

```
npx firestore-migrate create <name> <release-type> --path [path]
```

- `<name>`: A lower kebab case name to identify the migration.
- `<release-type>`: Semver release increment. Either "major", "premajor", "minor", "preminor", "patch", "prepatch" or "prerelease".
- `-p, --path [path]`: Defaults to `./migrations`

```
npx firestore-migrate create new-collections patch
```

#### migrate

This requires that you have the environment variables set for admin to [initialise without parameters](https://firebase.google.com/docs/admin/setup#initialize-without-parameters).

```
npx firestore-migrate migrate --path [path]
```

- `-p, --path [path]`: Defaults to `./migrations`
- `-t, --to [to]`: Version to migrate up or down to. Updates to latest when not passed.

### Programmatically

Alternatively you can call migrate programmatically. This is useful for running in cloud functions where the env variables are already set for you.

```
import { migrate } from 'firestore-migrate';

migrate({ path: './migrations' });
```
