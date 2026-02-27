import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { Card, CardContent, CardFooter, CardHeader } from '../../../../design-system/ui/card';

interface AppAnnouncementProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  header?: string;
  description?: string;
  datasource?: any;
  whatsnewlink?: string;
}

export default function AppAnnouncement(props: AppAnnouncementProps) {
  const { header = '', description = '', datasource = [], whatsnewlink = '' } = props;
  let details = [];
  if (datasource && datasource.source) {
    details = datasource.source.map((item) => {
      return item.name;
    });
  }

  const handleClick = () => {
    window.open(whatsnewlink);
  };

  return (
    <Card title='AppAnnouncement' className='my-1 border-l-[6px] border-l-primary/60'>
      <CardHeader>
        <h6 className='text-lg font-semibold'>{header}</h6>
      </CardHeader>
      <CardContent>
        <p className='mb-2 text-base'>{description}</p>
        {details.map((itm, idx) => {
          const theKey = `AppAnn-item-${idx}`;
          return (
            <p key={theKey} className='text-sm'>
              - {itm}
            </p>
          );
        })}
      </CardContent>
      <CardFooter>
        <button type='button' className='text-sm text-primary hover:underline' onClick={handleClick}>
          See what&apos;s new
        </button>
      </CardFooter>
    </Card>
  );
}
