import { createFileRoute } from '@tanstack/react-router';
import DesingSystem from '../app/desingsystem';

// eslint-disable-next-line import/prefer-default-export
export const Route = createFileRoute('/desingsystem')({
  component: DesingSystem
});
