export class QuestionBankMigrationRegistry {
  #migrations = new Map();

  register(fromVersion, toVersion, migrate) {
    if (typeof migrate !== "function") throw new TypeError("Migration must be a function");
    const edges = this.#migrations.get(fromVersion) ?? new Map();
    if (edges.has(toVersion)) throw new Error(`Migration already registered: ${fromVersion}->${toVersion}`);
    edges.set(toVersion, migrate);
    this.#migrations.set(fromVersion, edges);
    return this;
  }

  migrate(manifest, targetVersion, path) {
    let current = structuredClone(manifest);
    const steps = path ?? this.#findPath(current.version, targetVersion);
    for (const toVersion of steps) {
      const migration = this.#migrations.get(current.version)?.get(toVersion);
      if (!migration) throw new Error(`Missing question-bank migration: ${current.version}->${toVersion}`);
      current = migration(structuredClone(current));
      current.version = toVersion;
    }
    if (current.version !== targetVersion) throw new Error(`Migration ended at ${current.version}, expected ${targetVersion}`);
    return current;
  }

  #findPath(fromVersion, targetVersion) {
    if (fromVersion === targetVersion) return [];
    const queue = [{ version: fromVersion, path: [] }];
    const visited = new Set([fromVersion]);
    while (queue.length) {
      const current = queue.shift();
      for (const nextVersion of this.#migrations.get(current.version)?.keys() ?? []) {
        const path = [...current.path, nextVersion];
        if (nextVersion === targetVersion) return path;
        if (!visited.has(nextVersion)) {
          visited.add(nextVersion);
          queue.push({ version: nextVersion, path });
        }
      }
    }
    throw new Error(`No migration path from ${fromVersion} to ${targetVersion}`);
  }
}
