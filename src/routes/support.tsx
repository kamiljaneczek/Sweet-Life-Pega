import { createFileRoute } from '@tanstack/react-router';
import Support from '../app/support';

export const Route = createFileRoute('/support')({
  component: Support
});
