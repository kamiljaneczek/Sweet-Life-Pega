import { createFileRoute } from '@tanstack/react-router';
import SupportCustom from '../app/support-custom';

// eslint-disable-next-line import/prefer-default-export
export const Route = createFileRoute('/support-custom')({
  component: SupportCustom
});
