import { createFileRoute } from '@tanstack/react-router';
import Contact from '../app/contact';

export const Route = createFileRoute('/contact')({
  component: Contact
});
