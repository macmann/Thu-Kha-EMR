# Prisma migration troubleshooting

When running `prisma migrate deploy` against a shared database, Prisma will refuse to apply new migrations if any previous migration is still marked as failed.  This protects the history in the `_prisma_migrations` table, but it also means that a partially-applied migration must be explicitly resolved before development can continue.

## "system_admin_role" failure (P3009)

If you see output similar to:

```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-noisy-paper-a1bxuoqo.ap-southeast-1.aws.neon.tech"
Error: P3009
migrate found failed migrations in the target database, new migrations will not be applied.
The `20250501000000_system_admin_role` migration started at ... failed
```

resolve the failure by marking the broken migration as rolled back and then rerunning the deploy:

```bash
# mark the failed migration as rolled back so Prisma will continue
npm run migrate:resolve:system-admin

# re-apply migrations
npm run migrate:deploy
```

The `migrate:resolve:system-admin` helper simply calls:

```bash
prisma migrate resolve --rolled-back "20250501000000_system_admin_role"
```

This tells Prisma that the migration should be treated as rolled back.  You can then create a follow-up migration (if needed) or allow the subsequent migrations in this repository to apply normally.

> **Note:** Prisma never deletes the failed migration record from `_prisma_migrations`.  It is safe to keep the entry as "rolled back" so long as a replacement migration has been checked in (as is the case in this repository).
