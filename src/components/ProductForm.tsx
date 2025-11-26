import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Product, ProductCategory, RentalStatus } from '@/store/slices/productsSlice';
import { toast } from 'sonner';

type ProductFormFields = {
  name: string;
  description: string;
  category: ProductCategory;
  image_url: string;
  rental_price_per_day: string;
  refundable_deposit: string;
  status: RentalStatus;
  specifications: Record<string, string>;
};

type ProductFormProps = {
  product?: Product | null;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
};

const ProductForm = ({ product, onSubmit, onCancel, loading = false }: ProductFormProps) => {
  const [formData, setFormData] = useState<ProductFormFields>({
    name: '',
    description: '',
    category: 'electronics',
    image_url: '',
    rental_price_per_day: '',
    refundable_deposit: '',
    status: 'available',
    specifications: {},
  });

  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        image_url: product.image,
        rental_price_per_day: String(product.rentalPricePerDay ?? ''),
        refundable_deposit: String(product.refundableDeposit ?? ''),
        status: product.status,
        specifications: product.specifications || {},
      });
      setSpecs(
        Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value }))
      );
      setImagePreview(product.image || '');
      setImageFile(null);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'electronics',
        image_url: '',
        rental_price_per_day: '',
        refundable_deposit: '',
        status: 'available',
        specifications: {},
      });
      setSpecs([]);
      setImagePreview('');
      setImageFile(null);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    }
  }, [product]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;
    setImagePreview(previewUrl);
    setImageFile(file);
    setFormData((prev) => ({ ...prev, image_url: '' }));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setSpecs(newSpecs);
  };

  const addSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rentalPrice = parseFloat(formData.rental_price_per_day || '0');
    const refundableDeposit = parseFloat(formData.refundable_deposit || '0');

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.rental_price_per_day.trim() || rentalPrice <= 0) {
      toast.error('Rental price per day must be greater than 0');
      return;
    }

    if (refundableDeposit < 0) {
      toast.error('Refundable deposit cannot be negative');
      return;
    }

    if (!product && !imageFile) {
      toast.error('Please upload a product image');
      return;
    }

    if (product && !imageFile && !formData.image_url) {
      toast.error('Product image is required');
      return;
    }

    const specifications: Record<string, string> = {};
    specs.forEach((spec) => {
      if (spec.key.trim() && spec.value.trim()) {
        specifications[spec.key.trim()] = spec.value.trim();
      }
    });

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('description', formData.description.trim());
    payload.append('category', formData.category);
    payload.append('rental_price_per_day', formData.rental_price_per_day.trim());
    payload.append('refundable_deposit', formData.refundable_deposit.trim());
    payload.append('status', formData.status);

    if (Object.keys(specifications).length > 0) {
      payload.append('specifications', JSON.stringify(specifications));
    }

    if (imageFile) {
      payload.append('image', imageFile);
    } else if (formData.image_url) {
      payload.append('image_url', formData.image_url);
    }

    await onSubmit(payload);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
        <CardDescription>
          {product ? 'Update product information' : 'Fill in the details of your product'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., MacBook Pro 16"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="appliances">Appliances</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_image">
              Product Image {product ? '' : '*'}
            </Label>
            <Input
              id="product_image"
              name="product_image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />
            {imagePreview ? (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-muted-foreground">Preview</p>
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="h-36 w-36 rounded-lg object-cover border"
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Upload an image to showcase your product.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rental_price_per_day">Rental Price per Day (₹) *</Label>
              <Input
                id="rental_price_per_day"
                name="rental_price_per_day"
                type="number"
                min="0"
                step="0.01"
                value={formData.rental_price_per_day}
                onChange={handleChange}
                placeholder="50.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refundable_deposit">Refundable Deposit (₹) *</Label>
              <Input
                id="refundable_deposit"
                name="refundable_deposit"
                type="number"
                min="0"
                step="0.01"
                value={formData.refundable_deposit}
                onChange={handleChange}
                placeholder="2000.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Specifications</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSpec}>
                Add Specification
              </Button>
            </div>
            <div className="space-y-2">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Key (e.g., Processor)"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                  />
                  <Input
                    placeholder="Value (e.g., Apple M3)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeSpec(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              {specs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No specifications added. Click "Add Specification" to add details.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;

