import { createFileRoute } from '@tanstack/react-router';
import Company from '../app/company';

// eslint-disable-next-line import/prefer-default-export
export const Route = createFileRoute('/company')({
  component: Company
});
