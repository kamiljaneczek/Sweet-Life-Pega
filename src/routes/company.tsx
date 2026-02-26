import { createFileRoute } from '@tanstack/react-router';
import Company from '../app/company';

export const Route = createFileRoute('/company')({
  component: Company
});
