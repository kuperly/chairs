/**
 * Seed events to the database
 * Run with: npm run seed:events
 */

// Load environment variables FIRST before any imports
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

// Now import after env vars are loaded
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedEvents() {
  console.log('🚀 Starting to seed events...\n');

  // Get manufacturer ID
  const { data: manufacturers, error: mfgError } = await supabase
    .from('manufacturers')
    .select('id')
    .limit(1);

  if (mfgError) {
    console.error('❌ Error fetching manufacturers:', mfgError);
    process.exit(1);
  }

  if (!manufacturers || manufacturers.length === 0) {
    console.error('❌ No manufacturers found. Please run seed script first.');
    process.exit(1);
  }

  const manufacturerId = manufacturers[0].id;
  console.log(`✅ Found manufacturer: ${manufacturerId}`);

  // Get product IDs
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .limit(5);

  const productIds = products?.map(p => p.id) || [];
  console.log(`✅ Found ${productIds.length} products\n`);

  // Delete existing events to avoid duplicates
  console.log('🗑️  Clearing existing events...');
  await supabase.from('event_featured_products').delete().neq('eventId', '00000000-0000-0000-0000-000000000000');
  await supabase.from('live_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Create events
  const now = new Date();
  const events = [
    {
      title: "Premium Office Furniture Showcase",
      description: "Live factory tour featuring our latest ergonomic office chairs and standing desks. Special discounts only during the live event!",
      scheduledStartTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      scheduledEndTime: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      purchaseWindowEndTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnailUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
      status: "scheduled" as const,
      agoraChannelName: "premium-office-showcase",
      manufacturerId,
      viewerCount: 0,
    },
    {
      title: "Gaming Chairs & Accessories Live",
      description: "Exclusive live event showcasing RGB gaming chairs, desks, and accessories. Watch the products in action and ask questions in real-time!",
      scheduledStartTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      scheduledEndTime: new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString(),
      purchaseWindowEndTime: new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnailUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80",
      status: "scheduled" as const,
      agoraChannelName: "gaming-chairs-live",
      manufacturerId,
      viewerCount: 0,
    },
    {
      title: "Ergonomic Work Solutions - Live Now!",
      description: "Join us LIVE for an exclusive tour of our ergonomic furniture production. See how we create premium quality chairs and desks!",
      scheduledStartTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      scheduledEndTime: new Date(now.getTime() + 90 * 60 * 1000).toISOString(),
      purchaseWindowEndTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      status: "live" as const,
      agoraChannelName: "ergonomic-solutions-live",
      actualStartTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      manufacturerId,
      viewerCount: 127,
    }
  ];

  console.log('📅 Creating events...');

  const { data: createdEvents, error: eventsError } = await supabase
    .from('live_events')
    .insert(events)
    .select('*');

  if (eventsError) {
    console.error('❌ Error creating events:', eventsError);
    process.exit(1);
  }

  console.log(`✅ Created ${createdEvents?.length || 0} events`);

  // Add featured products to events
  if (createdEvents && productIds.length > 0) {
    console.log('\n🎯 Adding featured products to events...');

    const featuredProducts = [];
    for (const event of createdEvents) {
      // Add first 2-3 products as featured for each event
      const productsToFeature = productIds.slice(0, Math.min(3, productIds.length));
      for (const productId of productsToFeature) {
        featuredProducts.push({
          eventId: event.id,
          productId,
        });
      }
    }

    const { error: featuredError } = await supabase
      .from('event_featured_products')
      .insert(featuredProducts);

    if (featuredError) {
      console.error('❌ Error adding featured products:', featuredError);
    } else {
      console.log(`✅ Added ${featuredProducts.length} featured product associations`);
    }
  }

  console.log('\n📊 Summary:');
  const liveCount = createdEvents?.filter(e => e.status === 'live').length || 0;
  const scheduledCount = createdEvents?.filter(e => e.status === 'scheduled').length || 0;

  console.log(`- Live events: ${liveCount}`);
  console.log(`- Scheduled events: ${scheduledCount}`);
  console.log(`- Total events: ${createdEvents?.length || 0}`);

  console.log('\n✨ Events seeded successfully!');
  console.log('\n🎉 You can now test:');
  console.log('- Homepage: http://localhost:3001 (live events carousel)');
  console.log('- Live page: http://localhost:3001/live (live event details)');
  console.log('- Dashboard: http://localhost:3001/dashboard (upcoming events)');

  process.exit(0);
}

seedEvents().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
