import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';

interface ErrorBoundaryProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  isInternalError?: boolean;
}

export default function ErrorBoundary(props: ErrorBoundaryProps) {
  const errorMsg = PCore.getErrorHandler().getGenericFailedMessage();
  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'Messages';
  const ERROR_TEXT = localizedVal(errorMsg, localeCategory);
  const WORK_AREA = 'workarea';
  const ERROR_WHILE_RENDERING = 'ERROR_WHILE_RENDERING';
  const { getPConnect, isInternalError = false } = props;

  const theErrorDiv = <div>{ERROR_TEXT}</div>;

  if (!getPConnect) {
    return theErrorDiv;
  }

  const pConn = getPConnect();

  if (!isInternalError) {
    // eslint-disable-next-line no-console
    console.error(`
  ${localizedVal('Unable to load the component', localeCategory)} ${pConn.getComponentName()}
  ${localizedVal('This might be due to the view metadata getting corrupted or the component file missing.', localeCategory)}
  Raw metadata for the component: ${JSON.stringify(pConn.getRawMetadata())}
`);
  }

  if ((pConn.getConfigProps() as any).type === 'page') {
    return theErrorDiv;
  }

  if (pConn.getContainerName() === WORK_AREA || pConn.isInsideList() === true || pConn.getContainerName() === 'modal') {
    const { publish } = PCore.getPubSubUtils();
    // @ts-ignore - second parameter “payload” for publish method should be optional
    publish(ERROR_WHILE_RENDERING);
    return null;
  }

  return theErrorDiv;
}
