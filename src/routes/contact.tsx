import { createFileRoute } from '@tanstack/react-router';
import Contact from '../app/contact';

// eslint-disable-next-line import/prefer-default-export
export const Route = createFileRoute('/contact')({
  component: Contact
});
