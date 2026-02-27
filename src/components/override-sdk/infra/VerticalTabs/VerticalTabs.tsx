import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import React, { useEffect, useState } from 'react';

// VerticalTabs does NOT have getPConnect. So, no need to extend from PConnProps
interface VerticalTabsProps {
  // If any, enter additional props that only exist on this component
  tabconfig: any[];
}

// Implementation of custom event inspired by:
//  https://betterprogramming.pub/master-your-react-skills-with-event-listeners-ebc01dde4fad
const createCustomEvent = (eventName: string, additionalData: { [key: string]: string }): CustomEvent | null => {
  if (window) {
    return new CustomEvent(eventName, {
      detail: { additionalData }
    });
  }

  return null;
};

export default function VerticalTabs(props: VerticalTabsProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const LeftAlignVerticalTab = getComponentFromMap('LeftAlignVerticalTabs');

  // Get a React warning when we use tabConfig as mixed case. So all lowercase tabconfig
  const { tabconfig = [] } = props;
  const [value, setValue] = useState(0);

  useEffect(() => {
    const eventData = { itemClicked: value.toString() };
    const myEvent = createCustomEvent('VerticalTabClick', eventData);

    if (myEvent !== null) {
      document.dispatchEvent(myEvent);
    }
  }, [value]);

  const handleTabClick = (index: number) => {
    setValue(index);
  };

  return (
    <div id='VerticalTabs'>
      {/* VerticalTabs: {JSON.stringify(tabconfig)} */}
      <div className='flex flex-col' role='tablist' aria-orientation='vertical'>
        {tabconfig.map((tab, index) => (
          <LeftAlignVerticalTab {...props} label={tab.name} key={tab.name} selected={value === index} onClick={() => handleTabClick(index)} />
        ))}
      </div>
    </div>
  );
}
