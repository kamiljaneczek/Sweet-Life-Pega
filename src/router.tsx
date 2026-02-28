import { createRouter } from '@tanstack/react-router';
import { queryClient } from './api/query-client';
import { routeTree } from './routeTree.gen';

// eslint-disable-next-line import/prefer-default-export
export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultNotFoundComponent: () => <div>Page not found</div>
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
