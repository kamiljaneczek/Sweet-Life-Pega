// FieldValueList is one of the few components that does NOT have getPConnect.
//  So, no need to extend PConnProps
interface FieldValueListProps {
  // If any, enter additional props that only exist on this component
  name?: string;
  value: any;
  variant?: string;
}

function formatItemValue(value) {
  let formattedVal = value;

  // if the value is undefined or an empty string, we want to display it as "---"
  if (formattedVal === undefined || formattedVal === '') {
    formattedVal = '---';
  }

  return formattedVal;
}

export default function FieldValueList(props: FieldValueListProps) {
  const { name, value, variant = 'inline' } = props;

  function getGridItemLabel() {
    return (
      <div className={variant === 'stacked' ? 'w-full pb-0' : 'w-1/2'}>
        <span className='text-sm dark:text-primary-foreground'>{name}</span>
      </div>
    );
  }

  function getGridItemValue() {
    const formattedValue = formatItemValue(value);

    return (
      <div className={variant === 'stacked' ? 'w-full pt-0' : 'w-1/2'}>
        <span className={`${variant === 'stacked' ? 'text-lg font-medium' : 'text-sm'} dark:text-primary-foreground`}>{formattedValue}</span>
      </div>
    );
  }

  return (
    <div className={`flex ${variant === 'stacked' ? 'flex-col' : 'flex-row'} justify-between gap-4`}>
      {getGridItemLabel()}
      {getGridItemValue()}
    </div>
  );
}
