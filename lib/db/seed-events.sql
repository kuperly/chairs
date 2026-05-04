-- Seed Events SQL
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

-- First, clear existing events (optional)
DELETE FROM event_featured_products WHERE "eventId" IS NOT NULL;
DELETE FROM live_events WHERE id IS NOT NULL;

-- Get the manufacturer ID (we'll use this in INSERT)
-- Replace YOUR_MANUFACTURER_ID with the actual ID from manufacturers table

-- Insert 3 sample events
INSERT INTO live_events (
  id,
  title,
  description,
  "scheduledStartTime",
  "scheduledEndTime",
  "purchaseWindowEndTime",
  "thumbnailUrl",
  status,
  "agoraChannelName",
  "manufacturerId",
  "viewerCount",
  "actualStartTime"
)
SELECT
  gen_random_uuid(),
  'Premium Office Furniture Showcase',
  'Live factory tour featuring our latest ergonomic office chairs and standing desks. Special discounts only during the live event!',
  NOW() + INTERVAL '2 hours',
  NOW() + INTERVAL '3 hours',
  NOW() + INTERVAL '10 days',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
  'scheduled'::text,
  'premium-office-showcase',
  m.id,
  0,
  NULL
FROM manufacturers m
LIMIT 1

UNION ALL

SELECT
  gen_random_uuid(),
  'Gaming Chairs & Accessories Live',
  'Exclusive live event showcasing RGB gaming chairs, desks, and accessories. Watch the products in action and ask questions in real-time!',
  NOW() + INTERVAL '24 hours',
  NOW() + INTERVAL '25 hours',
  NOW() + INTERVAL '31 days',
  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80',
  'scheduled'::text,
  'gaming-chairs-live',
  m.id,
  0,
  NULL
FROM manufacturers m
LIMIT 1

UNION ALL

SELECT
  gen_random_uuid(),
  'Ergonomic Work Solutions - Live Now!',
  'Join us LIVE for an exclusive tour of our ergonomic furniture production. See how we create premium quality chairs and desks!',
  NOW() - INTERVAL '30 minutes',
  NOW() + INTERVAL '90 minutes',
  NOW() + INTERVAL '7 days',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  'live'::text,
  'ergonomic-solutions-live',
  m.id,
  127,
  NOW() - INTERVAL '30 minutes'
FROM manufacturers m
LIMIT 1;

-- Add featured products to events
-- This links the first 3 products to each event
INSERT INTO event_featured_products ("eventId", "productId")
SELECT
  e.id as "eventId",
  p.id as "productId"
FROM live_events e
CROSS JOIN (
  SELECT id FROM products ORDER BY "createdAt" LIMIT 3
) p;

-- Verify the data
SELECT
  COUNT(*) as event_count,
  COUNT(CASE WHEN status = 'live' THEN 1 END) as live_count,
  COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_count
FROM live_events;

SELECT
  e.title,
  e.status,
  e."viewerCount",
  COUNT(efp."productId") as featured_products_count
FROM live_events e
LEFT JOIN event_featured_products efp ON e.id = efp."eventId"
GROUP BY e.id, e.title, e.status, e."viewerCount"
ORDER BY e."scheduledStartTime";
