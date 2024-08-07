import { PropsWithChildren, useState } from 'react';

import { ArrowDown, ArrowRight } from 'lucide-react';

// FieldGroupProps is one of the few components that does NOT have getPConnect.
//  So, no need to extend PConnProps
interface FieldGroupProps {
  // If any, enter additional props that only exist on this component
  name?: string;
  collapsible?: boolean;
  instructions?: string;
}

export default function FieldGroup(props: PropsWithChildren<FieldGroupProps>) {
  const { children, name, collapsible = false, instructions } = props;

  const [collapsed, setCollapsed] = useState(false);

  const descAndChildren = (
    <div>
      <div className='w-full'>{children}</div>
    </div>
  );

  const headerClickHandler = () => {
    setCollapsed(current => !current);
  };

  return (
    <div className='flex flex-row justify-between'>
      <div className='w-full mt-6 mb-8'>
        {name && (
          <div className='text-center mb-6 '>
            {collapsible ? (
              <span id='field-group-header' className='text-center pb-6 text-xl font-medium' onClick={headerClickHandler}>
                {collapsed ? <ArrowRight /> : <ArrowDown />}
                lili {name}
              </span>
            ) : (
              <span id='field-group-header' className=' text-center text-xl font-medium'>
                {name}
              </span>
            )}
          </div>
        )}
        {instructions && instructions !== 'none' && (
          <div key='instructions' className='mb-2 text-base font-normal' dangerouslySetInnerHTML={{ __html: instructions }} />
        )}
        {!collapsed && descAndChildren}
      </div>
    </div>
  );
}
