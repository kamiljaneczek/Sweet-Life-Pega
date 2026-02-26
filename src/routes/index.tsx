import { createFileRoute } from '@tanstack/react-router';
import Home from '../app/home';

// eslint-disable-next-line import/prefer-default-export
export const Route = createFileRoute('/')({
  component: Home
});
