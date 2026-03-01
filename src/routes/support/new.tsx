import { createFileRoute, Outlet } from '@tanstack/react-router';

// eslint-disable-next-line import/prefer-default-export
export const Route = createFileRoute('/support/new')({
  component: () => <Outlet />
});
