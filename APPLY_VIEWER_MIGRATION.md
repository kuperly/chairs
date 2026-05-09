# Apply Viewer Tracking Migration

The real-time viewer count feature requires a database migration to add RPC functions.

## Option 1: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/eifbzcssqezgzdxsgzjc/sql
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/20260510000000_add_viewer_tracking_functions.sql`
4. Click "Run"

## Option 2: Supabase CLI

```bash
npx supabase link --project-ref eifbzcssqezgzdxsgzjc
npx supabase db push
```

## What This Migration Does

- Creates `increment_viewer_count(event_id UUID)` - Atomically increments viewer count
- Creates `decrement_viewer_count(event_id UUID)` - Atomically decrements viewer count (minimum 0)
- Grants execute permissions to authenticated and anonymous users

## Verification

After applying, the viewer count should update in real-time:
- Open a live event page as a viewer
- Open the broadcast dashboard for the same event
- The viewer count should increment/decrement as viewers join/leave
