/**
 * Script to add sample events to the database
 * Run with: node scripts/add-events.js
 */

const API_BASE = 'http://localhost:3001/api';

// Sample events data
const events = [
  {
    title: "Premium Office Furniture Showcase",
    description: "Live factory tour featuring our latest ergonomic office chairs and standing desks. Special discounts only during the live event!",
    scheduledStartTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    scheduledEndTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    purchaseWindowEndTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    thumbnailUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
    status: "scheduled",
    agoraChannelName: "premium-office-showcase",
    manufacturerId: null, // Will be filled with actual manufacturer ID
    featuredProductIds: [] // Will be filled with actual product IDs
  },
  {
    title: "Gaming Chairs & Accessories Live",
    description: "Exclusive live event showcasing RGB gaming chairs, desks, and accessories. Watch the products in action and ask questions in real-time!",
    scheduledStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    scheduledEndTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    purchaseWindowEndTime: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80",
    status: "scheduled",
    agoraChannelName: "gaming-chairs-live",
    manufacturerId: null,
    featuredProductIds: []
  },
  {
    title: "Ergonomic Work Solutions - Live Now",
    description: "Join us LIVE for an exclusive tour of our ergonomic furniture production. See how we create premium quality chairs and desks!",
    scheduledStartTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30 min ago
    scheduledEndTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Ends in 30 min
    purchaseWindowEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    status: "live",
    agoraChannelName: "ergonomic-solutions-live",
    actualStartTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    viewerCount: 127,
    manufacturerId: null,
    featuredProductIds: []
  }
];

async function getManufacturerId() {
  try {
    const response = await fetch(`${API_BASE}/manufacturers`);
    const data = await response.json();

    if (data.data && data.data.manufacturers && data.data.manufacturers.length > 0) {
      return data.data.manufacturers[0].id;
    }

    console.error('No manufacturers found in database');
    return null;
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    return null;
  }
}

async function getProductIds() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    const data = await response.json();

    if (data.data && data.data.products && data.data.products.length > 0) {
      // Return first 3 product IDs
      return data.data.products.slice(0, 3).map(p => p.id);
    }

    console.error('No products found in database');
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function createEvent(eventData) {
  try {
    const response = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Failed to create event: ${eventData.title}`);
      console.error('Error:', data);
      return null;
    }

    console.log(`✅ Created event: ${eventData.title}`);
    return data.data;
  } catch (error) {
    console.error(`Error creating event: ${eventData.title}`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting to add events...\n');

  // Get manufacturer ID and product IDs
  console.log('📦 Fetching manufacturer and products...');
  const manufacturerId = await getManufacturerId();
  const productIds = await getProductIds();

  if (!manufacturerId) {
    console.error('❌ Cannot create events without a manufacturer. Please run seed script first.');
    process.exit(1);
  }

  console.log(`✅ Found manufacturer: ${manufacturerId}`);
  console.log(`✅ Found ${productIds.length} products\n`);

  // Update events with actual IDs
  const eventsToCreate = events.map(event => ({
    ...event,
    manufacturerId,
    featuredProductIds: productIds.slice(0, 2) // Use first 2 products
  }));

  // Create events
  console.log('📅 Creating events...\n');
  const createdEvents = [];

  for (const event of eventsToCreate) {
    const created = await createEvent(event);
    if (created) {
      createdEvents.push(created);
    }
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✨ Successfully created ${createdEvents.length} events!`);
  console.log('\n📊 Summary:');
  console.log(`- Live events: ${createdEvents.filter(e => e.status === 'live').length}`);
  console.log(`- Scheduled events: ${createdEvents.filter(e => e.status === 'scheduled').length}`);
  console.log('\n🎉 You can now test the application with live events!');
}

main().catch(console.error);
