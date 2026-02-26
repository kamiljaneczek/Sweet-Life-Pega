import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';

interface TextContentProps extends PConnProps {
  // If any, enter additional props that only exist on TextContent here
  content: string;
  displayAs: 'Paragraph' | 'Heading 1' | 'Heading 2' | 'Heading 3' | 'Heading 4';
}

export default function TextContent(props: TextContentProps) {
  type ExpectedDisplayAs = 'Paragraph' | 'Heading 1' | 'Heading 2' | 'Heading 3' | 'Heading 4';

  const { content, displayAs }: { content: string; displayAs: ExpectedDisplayAs } = props;

  switch (displayAs) {
    case 'Paragraph':
      return <p className='text-base'>{content}</p>;

    case 'Heading 1':
      return <h1 className='text-4xl font-bold'>{content}</h1>;

    case 'Heading 2':
      return <h2 className='text-3xl font-bold'>{content}</h2>;

    case 'Heading 3':
      return <h3 className='text-2xl font-semibold'>{content}</h3>;

    case 'Heading 4':
      return <h4 className='text-xl font-semibold'>{content}</h4>;

    default:
      console.error(`TextContent got an expected displayAs prop: ${displayAs}`);
      return <p className='text-base'>{content}</p>;
  }
}
