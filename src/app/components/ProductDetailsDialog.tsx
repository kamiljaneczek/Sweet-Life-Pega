import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { type CreateProductPayload, type Product, productListQueryOptions, useDeleteProduct, useUpdateProduct } from '../../api/hooks/usePCoreQuery';
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

interface ProductDetailsDialogProps {
  product: Product;
}

export default function ProductDetailsDialog({ product }: ProductDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [form, setForm] = useState<CreateProductPayload>(() => toForm(product));

  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
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

  function toForm(p: Product): CreateProductPayload {
    return { Name: p.Name, SKU: p.SKU, Category: p.Category, CategoryName: p.CategoryName, Cost: p.Cost, ShortDesc: p.ShortDesc ?? '' };
  }

  const reset = () => {
    setForm(toForm(product));
    setEditing(false);
    setConfirmingDelete(false);
    updateMutation.reset();
    deleteMutation.reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const handleSave = () => {
    updateMutation.mutate(
      { pyGUID: product.pyGUID, product: form },
      {
        onSuccess: () => setEditing(false)
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(product.pyGUID, {
      onSuccess: () => setOpen(false)
    });
  };

  const set = (field: keyof CreateProductPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'Cost' ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant='accent'>Show details</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Product' : product.Name}</DialogTitle>
          <DialogDescription>{editing ? 'Update the product details below.' : `SKU: ${product.SKU}`}</DialogDescription>
        </DialogHeader>

        <DialogBody className='space-y-4'>
          {updateMutation.isError && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>{updateMutation.error?.message ?? 'Failed to update'}</div>
          )}
          {deleteMutation.isError && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>{deleteMutation.error?.message ?? 'Failed to delete'}</div>
          )}

          {editing ? (
            <>
              <Input label='Name' value={form.Name} onChange={set('Name')} error={false} helperText='' InputProps={{}} />
              <Input label='SKU' value={form.SKU} onChange={set('SKU')} error={false} helperText='' InputProps={{}} />

              <div>
                <Label className='block text-base font-normal text-gray-900 dark:text-gray-300'>Category</Label>
                <select
                  value={form.Category}
                  onChange={(e) => {
                    const val = e.target.value;
                    const cat = categories.find((c) => c.value === val);
                    setForm((prev) => ({ ...prev, Category: val, CategoryName: cat?.label ?? '' }));
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
              </div>

              <Input label='Cost' type='number' value={form.Cost || ''} onChange={set('Cost')} error={false} helperText='' InputProps={{}} />
              <Textarea label='Short Description' variant='outlined' helperText='' value={form.ShortDesc} onChange={set('ShortDesc')} />
            </>
          ) : (
            <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm'>
              <dt className='font-medium text-muted-foreground'>Name</dt>
              <dd>{product.Name}</dd>
              <dt className='font-medium text-muted-foreground'>SKU</dt>
              <dd>{product.SKU}</dd>
              <dt className='font-medium text-muted-foreground'>Category</dt>
              <dd>{product.CategoryName}</dd>
              <dt className='font-medium text-muted-foreground'>Cost</dt>
              <dd>${product.Cost}</dd>
              {product.ShortDesc && (
                <>
                  <dt className='font-medium text-muted-foreground'>Description</dt>
                  <dd>{product.ShortDesc}</dd>
                </>
              )}
            </dl>
          )}
        </DialogBody>

        <DialogFooter>
          {confirmingDelete ? (
            <>
              <span className='mr-auto text-sm text-destructive'>Are you sure?</span>
              <Button type='button' variant='secondary' onClick={() => setConfirmingDelete(false)}>
                No
              </Button>
              <Button type='button' variant='destructive' disabled={deleteMutation.isPending} onClick={handleDelete}>
                {deleteMutation.isPending ? 'Deleting...' : 'Yes, delete'}
              </Button>
            </>
          ) : editing ? (
            <>
              <Button type='button' variant='destructive' className='mr-auto' onClick={() => setConfirmingDelete(true)}>
                Delete
              </Button>
              <Button
                type='button'
                variant='secondary'
                onClick={() => {
                  setEditing(false);
                  setForm(toForm(product));
                }}
              >
                Cancel
              </Button>
              <Button type='button' variant='accent' disabled={updateMutation.isPending} onClick={handleSave}>
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button type='button' variant='destructive' className='mr-auto' onClick={() => setConfirmingDelete(true)}>
                Delete
              </Button>
              <DialogClose
                render={
                  <Button type='button' variant='secondary'>
                    Close
                  </Button>
                }
              />
              <Button type='button' variant='accent' onClick={() => setEditing(true)}>
                Edit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
