import { PropsWithChildren } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../design-system/ui/card';

// Pulse is one of the few components that does NOT have getPConnect.
//  So, no need to extend PConnProps
type PulseProps = {};

export default function Pulse(props: PropsWithChildren<PulseProps>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children } = props;

  return (
    <Card className='mt-2 mb-2 border-l-[6px] border-l-primary'>
      <CardHeader>
        <CardTitle className='text-lg'>Pulse</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-sm'>Pulse</p>
      </CardContent>
    </Card>
  );
}
