import { createFileRoute } from '@tanstack/react-router';
import Products from '../app/products';

export const Route = createFileRoute('/products')({
  component: Products
});
