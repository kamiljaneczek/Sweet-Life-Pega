import { createFileRoute } from '@tanstack/react-router';
import Support from '../app/support';

// eslint-disable-next-line import/prefer-default-export
export const Route = createFileRoute('/support')({
  component: Support
});
