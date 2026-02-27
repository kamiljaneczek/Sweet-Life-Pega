import StoreContext from '@pega/react-sdk-components/lib/bridge/Context/StoreContext';
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { Utils } from '@pega/react-sdk-components/lib/components/helpers/utils';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { PropsWithChildren, ReactElement, useContext, useEffect, useState } from 'react';
import { Button } from '../../../../design-system/ui/button';
import { Card, CardHeader } from '../../../../design-system/ui/card';

interface CaseViewProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  icon: string;
  subheader: string;
  header: string;
  showIconInHeader: boolean;
  caseInfo: any;
}

export default function CaseView(props: PropsWithChildren<CaseViewProps>) {
  // Get emitted components from map (so we can get any override that may exist)
  const CaseViewActionsMenu = getComponentFromMap('CaseViewActionsMenu');
  const VerticalTabs = getComponentFromMap('VerticalTabs');
  const DeferLoad = getComponentFromMap('DeferLoad');

  const {
    getPConnect,
    icon = '',
    header,
    subheader,
    children = [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    showIconInHeader = true,
    caseInfo: { availableActions = [], availableProcesses = [], hasNewAttachments, caseTypeID = '', caseTypeName = '' }
  } = props;

  const currentCaseID = props.caseInfo.ID;
  let isComponentMounted = true;

  const { displayOnlyFA } = useContext<any>(StoreContext);

  const thePConn = getPConnect();

  const editAction = availableActions.find((action) => action.ID === 'pyUpdateCaseDetails');

  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'CaseView';
  const localeKey = `${caseTypeID}!CASE!${caseTypeName}`.toUpperCase();

  /**
   *
   * @param inName the metadata <em>name</em> that will cause a region to be returned
   */
  function getChildRegionByName(inName: string): any {
    for (const child of children as ReactElement[]) {
      const theMetadataType: string = (child as ReactElement).props.getPConnect().getRawMetadata().type.toLowerCase();
      const theMetadataName: string = (child as ReactElement).props.getPConnect().getRawMetadata().name.toLowerCase();

      if (theMetadataType === 'region' && theMetadataName === inName) {
        return child;
      }
    }

    return null;
  }

  const theSummaryRegion = getChildRegionByName('summary');
  const theStagesRegion = getChildRegionByName('stages');
  const theTodoRegion = getChildRegionByName('todo');
  const theUtilitiesRegion = getChildRegionByName('utilities');
  const theTabsRegion = getChildRegionByName('tabs');

  const svgCase = Utils.getImageSrc(icon, Utils.getSDKStaticConentUrl());

  const [activeVertTab, setActiveVertTab] = useState(0);

  // const tmpLoadData1 = { config: { label: "Details", name: "pyDetailsTabContent" }, type: "DeferLoad" };
  // const tmpLoadData2 = { config: { label: "Case History", name: "CaseHistory" }, type: "DeferLoad" };

  // Extract the tabs we need to display from theTabsRegion (one tab per entry in theTabsRegionChildren)
  const theTabsRegionChildren = theTabsRegion.props.getPConnect().getChildren();

  // vertTabInfo is sent to VerticalTabs component
  const vertTabInfo: object[] = [];

  // deferLoadInfo is sent to DeferLoad component (currently selected entry)
  const deferLoadInfo: any[] = [];

  if (theTabsRegionChildren) {
    // populate vertTabInfo and deferLoadInfo
    theTabsRegionChildren.forEach((tabComp, index) => {
      const theTabCompConfig = tabComp.getPConnect().getConfigProps();
      // eslint-disable-next-line prefer-const
      let { label, inheritedProps } = theTabCompConfig;
      // For some tabs, "label" property is not avaialable in theTabCompConfig, so will get them from inheritedProps
      if (!label) {
        inheritedProps.forEach((inheritedProp) => {
          if (inheritedProp.prop === 'label') {
            label = inheritedProp.value;
          }
        });
      }
      // We'll display the tabs when either visibility property doesn't exist or is true(if exists)
      if (theTabCompConfig.visibility === undefined || theTabCompConfig.visibility === true) {
        vertTabInfo.push({ name: label, id: index });
        deferLoadInfo.push({ type: 'DeferLoad', config: theTabCompConfig });
      }
    });
  }

  function handleVerticalTabClick(eventDetail: any) {
    const theItem = parseInt(eventDetail.additionalData.itemClicked, 10);

    // only call useEffectSetter if the component is mounted
    if (isComponentMounted) {
      setActiveVertTab(theItem);
    }
  }

  // Add and Remove event listener for VerticalTabClick only at startup and teardown
  useEffect(() => {
    document.addEventListener('VerticalTabClick', (event: any) => {
      handleVerticalTabClick(event.detail);
    });

    return (): void => {
      // inform that the component is unmounted so other code can
      //  know not to try to call useState setters (to avoid console warnings)
      isComponentMounted = false;

      document.removeEventListener('VerticalTabClick', (event: any) => {
        handleVerticalTabClick(event.detail);
      });
    };
  }, []);

  useEffect(() => {
    if (hasNewAttachments) {
      // @ts-expect-error - Argument of type 'boolean' is not assignable to parameter of type 'object'
      PCore.getPubSubUtils().publish((PCore.getEvents().getCaseEvent() as any).CASE_ATTACHMENTS_UPDATED_FROM_CASEVIEW, true);
    }
  }, [hasNewAttachments]);

  function _editClick() {
    const actionsAPI = thePConn.getActionsApi();
    const openLocalAction = actionsAPI.openLocalAction.bind(actionsAPI);

    openLocalAction(editAction.ID, { ...editAction, containerName: 'modal', type: 'express' });
  }

  function getActionButtonsHtml(): any {
    return (
      <div className='flex items-center gap-2 p-2'>
        {editAction && (
          <Button
            variant='ghost'
            onClick={() => {
              _editClick();
            }}
          >
            {localizedVal('Edit', localeCategory)}
          </Button>
        )}
        <CaseViewActionsMenu
          getPConnect={getPConnect}
          availableActions={availableActions}
          availableProcesses={availableProcesses}
          caseTypeName={caseTypeName}
          caseTypeID={caseTypeID}
        />
      </div>
    );
  }

  function getContainerContents() {
    if (!displayOnlyFA) {
      // show full portal
      return (
        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-3'>
            <div hidden={true} id='current-caseID'>
              {currentCaseID}
            </div>
            <Card className='p-2 m-2'>
              <CardHeader className='bg-blue-100 text-blue-900 rounded-[inherit]'>
                <div className='flex items-center gap-4'>
                  <div className='flex h-16 w-16 items-center justify-center bg-blue-800 p-2'>
                    <img src={svgCase} className='invert' />
                  </div>
                  <div>
                    <h6 className='text-base font-semibold'>{PCore.getLocaleUtils().getLocaleValue(header, '', localeKey)}</h6>
                    <p className='text-sm' id='caseId'>
                      {subheader}
                    </p>
                  </div>
                </div>
              </CardHeader>
              {getActionButtonsHtml()}
              <hr className='border-t border-gray-200' />
              {theSummaryRegion}
              <hr className='border-t border-gray-200' />
              {vertTabInfo.length > 1 && <VerticalTabs tabconfig={vertTabInfo} />}
            </Card>
          </div>

          <div className='col-span-6'>
            {theStagesRegion}
            {theTodoRegion}
            {deferLoadInfo.length > 0 && <DeferLoad getPConnect={getPConnect} name={deferLoadInfo[activeVertTab].config.name} isTab />}
          </div>

          <div className='col-span-3'>{theUtilitiesRegion}</div>
        </div>
      );
    }
    // displayOnlyFA - only show the "todo" region
    return (
      <div className='grid grid-cols-12'>
        <div className='col-span-12'>{theTodoRegion}</div>
      </div>
    );
  }

  return getContainerContents();
}
