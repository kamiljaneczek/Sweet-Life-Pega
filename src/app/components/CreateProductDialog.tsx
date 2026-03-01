import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { type CreateProductPayload, productListQueryOptions, useCreateProduct } from '../../api/hooks/usePCoreQuery';
import { Button } from '../../design-system/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../design-system/ui/dialog';
import { Input } from '../../design-system/ui/input';
import { Label } from '../../design-system/ui/label';
import { Textarea } from '../../design-system/ui/textarea';

const emptyForm: CreateProductPayload = {
  Name: '',
  SKU: '',
  Category: '',
  CategoryName: '',
  ShortDesc: '',
  Cost: 0
};

export default function CreateProductDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateProductPayload>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateProductPayload, string>>>({});
  const mutation = useCreateProduct();
  const { data: products = [] } = useQuery(productListQueryOptions());

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      if (p.Category && p.CategoryName) {
        map.set(p.Category, p.CategoryName);
      }
    }
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [products]);

  const reset = () => {
    setForm(emptyForm);
    setErrors({});
    mutation.reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.Name.trim()) next.Name = 'Name is required';
    if (!form.SKU.trim()) next.SKU = 'SKU is required';
    if (!form.Category) next.Category = 'Category is required';
    if (form.Cost <= 0) next.Cost = 'Cost must be greater than 0';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate(form, {
      onSuccess: () => {
        reset();
        setOpen(false);
      }
    });
  };

  const set = (field: keyof CreateProductPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'Cost' ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant='accent'>New Product</Button>} />

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>Add a new product to the Sweet Life catalog.</DialogDescription>
          </DialogHeader>

          <DialogBody className='space-y-4'>
            {mutation.isError && (
              <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>{mutation.error?.message ?? 'Something went wrong'}</div>
            )}

            <Input
              label='Name'
              required
              error={!!errors.Name}
              helperText={errors.Name ?? ''}
              value={form.Name}
              onChange={set('Name')}
              InputProps={{}}
            />

            <Input label='SKU' required error={!!errors.SKU} helperText={errors.SKU ?? ''} value={form.SKU} onChange={set('SKU')} InputProps={{}} />

            <div>
              <Label className='block text-base font-normal text-gray-900 dark:text-gray-300'>Category *</Label>
              <select
                value={form.Category}
                onChange={(e) => {
                  const val = e.target.value;
                  const cat = categories.find((c) => c.value === val);
                  setForm((prev) => ({ ...prev, Category: val, CategoryName: cat?.label ?? '' }));
                  if (errors.Category) setErrors((prev) => ({ ...prev, Category: undefined }));
                }}
                className='flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              >
                <option value=''>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.Category && <Label className='block mt-1 pl-1 text-sm font-light text-destructive'>{errors.Category}</Label>}
            </div>

            <Input
              label='Cost'
              type='number'
              required
              error={!!errors.Cost}
              helperText={errors.Cost ?? ''}
              value={form.Cost || ''}
              onChange={set('Cost')}
              InputProps={{}}
            />

            <Textarea label='Short Description' variant='outlined' helperText='' value={form.ShortDesc} onChange={set('ShortDesc')} />
          </DialogBody>

          <DialogFooter>
            <DialogClose
              render={
                <Button type='button' variant='secondary'>
                  Cancel
                </Button>
              }
            />
            <Button type='submit' variant='accent' disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
