import { createFileRoute } from '@tanstack/react-router';
import ProductsList from '../app/products-list';

// eslint-disable-next-line import/prefer-default-export
export const Route = createFileRoute('/products-list')({
  component: ProductsList
});
