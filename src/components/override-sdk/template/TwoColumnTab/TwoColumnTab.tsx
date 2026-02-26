import { PropsWithChildren, ReactElement } from 'react';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';

import './TwoColumnTab.css';

interface TwoColumnTabProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  templateCol?: string;
}

export default function TwoColumnTab(props: PropsWithChildren<TwoColumnTabProps>) {
  const { children, templateCol = '1fr 1fr' } = props;
  const childrenToRender = children as ReactElement[];

  if (childrenToRender.length !== 2) {
    console.error(`TwoColumn template sees more than 2 columns: ${childrenToRender.length}`);
  }

  // templateCol is a valid CSS grid-template-columns value (e.g., "1fr 1fr", "1fr 2fr")
  // Responsive: stacks on small screens, uses templateCol proportions on md+
  return (
    <div className='psdk-two-column' style={{ '--template-col': templateCol } as React.CSSProperties}>
      <div className='psdk-two-column-column'>{childrenToRender[0]}</div>
      <div className='psdk-two-column-column'>{childrenToRender[1]}</div>
    </div>
  );
}
