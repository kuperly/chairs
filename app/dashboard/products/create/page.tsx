'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'sonner';

interface Manufacturer {
  id: string;
  companyName: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    stockQuantity: '',
    category: '',
    manufacturerId: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchManufacturers();
      }
    }
  }, [user, authLoading]);

  const fetchManufacturers = async () => {
    try {
      const response = await fetch('/api/manufacturers');
      if (!response.ok) {
        throw new Error('Failed to fetch manufacturers');
      }
      const data = await response.json();
      setManufacturers(data.manufacturers || []);

      // Auto-select first manufacturer if available
      if (data.manufacturers.length > 0) {
        setFormData(prev => ({
          ...prev,
          manufacturerId: data.manufacturers[0].id,
        }));
      }
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
      toast.error('Failed to load manufacturers');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const addImageUrlField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrlField = (index: number) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImageUrls.length === 0 ? [''] : newImageUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty image URLs
      const validImageUrls = imageUrls.filter((url) => url.trim() !== '');

      if (validImageUrls.length === 0) {
        toast.error('Please add at least one product image URL');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          compareAtPrice: formData.compareAtPrice
            ? parseFloat(formData.compareAtPrice)
            : null,
          stockQuantity: parseInt(formData.stockQuantity),
          imageUrls: validImageUrls,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      toast.success('Product created successfully');
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create Product</h1>
          <p className="text-muted-foreground mt-1">
            Add a new product to your catalog
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/products')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Executive Office Chair"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product..."
                className="w-full min-h-[100px] p-3 rounded-md border bg-background"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Chairs"
                  required
                />
              </div>

              <div>
                <Label htmlFor="manufacturerId">Manufacturer *</Label>
                <select
                  id="manufacturerId"
                  name="manufacturerId"
                  value={formData.manufacturerId}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-md border bg-background"
                  required
                >
                  {manufacturers.map((manufacturer) => (
                    <option key={manufacturer.id} value={manufacturer.id}>
                      {manufacturer.companyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="99.99"
                  required
                />
              </div>

              <div>
                <Label htmlFor="compareAtPrice">Compare at Price (USD)</Label>
                <Input
                  id="compareAtPrice"
                  name="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compareAtPrice}
                  onChange={handleInputChange}
                  placeholder="149.99"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="stockQuantity">Stock Quantity *</Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                placeholder="100"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {imageUrls.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeImageUrlField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addImageUrlField}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Add Another Image
            </Button>
            <p className="text-sm text-muted-foreground">
              For POC: Enter image URLs from Cloudinary or other CDN
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Product'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/products')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
