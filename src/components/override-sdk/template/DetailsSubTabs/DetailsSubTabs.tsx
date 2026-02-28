import { getTransientTabs, getVisibleTabs, tabClick } from '@pega/react-sdk-components/lib/components/template/SubTabs/tabUtils';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { Children, PropsWithChildren, useEffect, useState } from 'react';

interface DetailsSubTabsProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  showLabel: boolean;
  label: string;
}

export default function DetailsSubTabs(props: PropsWithChildren<DetailsSubTabsProps>) {
  const { children = [], label, showLabel = true, getPConnect } = props;
  // Get the inherited props from the parent to determine label settings
  const propsToUse = { label, showLabel, ...getPConnect().getInheritedProps() };

  const defaultTabIndex = 0;
  const deferLoadedTabs = Children.toArray(children)[0];
  let availableTabs = [];

  useEffect(() => {
    availableTabs = getVisibleTabs(deferLoadedTabs, 'detailsSubTabs');
  }, [availableTabs]);

  const [currentTabId, setCurrentTabId] = useState(defaultTabIndex.toString());

  const [tabItems, setTabitem] = useState([]);
  useEffect(() => {
    const tempTabItems = getTransientTabs(availableTabs, currentTabId, tabItems);
    setTabitem(tempTabItems);
  }, [currentTabId]);

  const handleTabClick = (id: string) => {
    setCurrentTabId(id);
    tabClick(id, availableTabs, currentTabId, setCurrentTabId, tabItems);
  };

  return (
    <>
      {propsToUse.showLabel && <span className='text-sm font-medium'>{propsToUse.label}</span>}
      <div>
        <div className='flex border-b border-border' role='tablist'>
          {tabItems.map((tab: any) => (
            <button
              key={tab.id}
              role='tab'
              aria-selected={currentTabId === tab.id}
              className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${
                currentTabId === tab.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {tabItems.map((tab: any) => (
          <div key={tab.id} role='tabpanel' tabIndex={+tab.id} className={currentTabId === tab.id ? 'pt-4' : 'hidden'}>
            <div>{tab.content ? tab.content : 'No content exists'}</div>
          </div>
        ))}
      </div>
    </>
  );
}
