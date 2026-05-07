'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Manufacturer {
  id: string;
  companyName: string;
}

interface Product {
  id: string;
  name: string;
  imageUrls: string[];
  price: number;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  thumbnailUrl: string | null;
  manufacturerId: string;
  status: string;
  event_featured_products?: Array<{
    products: {
      id: string;
    };
  }>;
}

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const eventId = params.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<string>('');
  const [eventStatus, setEventStatus] = useState<string>('');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    thumbnailUrl: '',
    manufacturerId: '',
    featuredProductIds: [] as string[],
  });

  // Convert ISO timestamp to datetime-local format
  const toDatetimeLocal = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Fetch event data
  useEffect(() => {
    async function fetchEvent() {
      try {
        setFetching(true);
        const response = await fetch(`/api/events/${eventId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch event');
        }

        const event: EventData = result.data;
        setEventStatus(event.status);

        // Can only edit draft or scheduled events
        if (event.status !== 'draft' && event.status !== 'scheduled') {
          setError('Only draft or scheduled events can be edited');
          return;
        }

        // Extract featured product IDs
        const featuredProductIds =
          event.event_featured_products?.map((efp) => efp.products.id) || [];

        setFormData({
          title: event.title,
          description: event.description,
          scheduledStartTime: toDatetimeLocal(event.scheduledStartTime),
          scheduledEndTime: toDatetimeLocal(event.scheduledEndTime),
          thumbnailUrl: event.thumbnailUrl || '',
          manufacturerId: event.manufacturerId,
          featuredProductIds,
        });

        setSelectedManufacturerId(event.manufacturerId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setFetching(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  // Fetch manufacturers
  useEffect(() => {
    async function fetchManufacturers() {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('id, companyName')
        .eq('isApproved', true)
        .eq('isHidden', false);

      if (!error && data) {
        setManufacturers(data);
      }
    }
    fetchManufacturers();
  }, [supabase]);

  // Fetch products when manufacturer is selected
  useEffect(() => {
    async function fetchProducts() {
      if (!selectedManufacturerId) {
        setProducts([]);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, name, imageUrls, price')
        .eq('manufacturerId', selectedManufacturerId)
        .eq('isActive', true);

      if (!error && data) {
        setProducts(data);
      }
    }
    fetchProducts();
  }, [selectedManufacturerId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Convert datetime-local to ISO format
      const payload = {
        ...formData,
        scheduledStartTime: new Date(formData.scheduledStartTime).toISOString(),
        scheduledEndTime: new Date(formData.scheduledEndTime).toISOString(),
        thumbnailUrl: formData.thumbnailUrl || null,
      };

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update event');
      }

      // Success! Redirect to events page
      router.push('/dashboard/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleManufacturerChange = (manufacturerId: string) => {
    setSelectedManufacturerId(manufacturerId);
    setFormData((prev) => ({
      ...prev,
      manufacturerId,
      featuredProductIds: [], // Reset selected products when manufacturer changes
    }));
  };

  const handleProductToggle = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      featuredProductIds: prev.featuredProductIds.includes(productId)
        ? prev.featuredProductIds.filter((id) => id !== productId)
        : [...prev.featuredProductIds, productId],
    }));
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error && eventStatus !== 'draft' && eventStatus !== 'scheduled') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/events">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Edit Event</h1>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Link href="/dashboard/events">
              <Button className="mt-4">Return to Events</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/events">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Edit Event</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Premium Office Furniture Showcase"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Live factory tour featuring our latest ergonomic office chairs..."
                className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>

            {/* Manufacturer */}
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <select
                id="manufacturer"
                required
                value={selectedManufacturerId}
                onChange={(e) => handleManufacturerChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">Select manufacturer...</option>
                {manufacturers.map((mfg) => (
                  <option key={mfg.id} value={mfg.id}>
                    {mfg.companyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Scheduled Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                required
                value={formData.scheduledStartTime}
                onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
              />
            </div>

            {/* Scheduled End Time */}
            <div className="space-y-2">
              <Label htmlFor="endTime">Scheduled End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                required
                value={formData.scheduledEndTime}
                onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Purchase window will automatically end 7 days after the scheduled end time
              </p>
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
              />
              <p className="text-xs text-muted-foreground">
                Optional: Add a thumbnail image URL for the event
              </p>
            </div>

            {/* Featured Products */}
            {selectedManufacturerId && (
              <div className="space-y-2">
                <Label>Featured Products (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select products to feature during this event
                </p>

                {products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No products available for this manufacturer
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border border-border rounded-md">
                    {products.map((product) => (
                      <label
                        key={product.id}
                        className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                          formData.featuredProductIds.includes(product.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.featuredProductIds.includes(product.id)}
                          onChange={() => handleProductToggle(product.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">${product.price}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/events')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Event'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
