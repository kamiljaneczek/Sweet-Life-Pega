import { createFileRoute } from '@tanstack/react-router';
import SupportNew from '../../../app/support-new';

// eslint-disable-next-line import/prefer-default-export
export const Route = createFileRoute('/support/new/')({
  component: SupportNew
});
