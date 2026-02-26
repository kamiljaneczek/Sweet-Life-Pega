import { createFileRoute } from '@tanstack/react-router';
import Home from '../app/home';

export const Route = createFileRoute('/')({
  component: Home
});
