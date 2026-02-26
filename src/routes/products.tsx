import { createFileRoute } from '@tanstack/react-router';
import Products from '../app/products';

// eslint-disable-next-line import/prefer-default-export
export const Route = createFileRoute('/products')({
  component: Products
});
