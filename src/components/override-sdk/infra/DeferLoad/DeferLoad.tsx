import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { Loader2 } from 'lucide-react';
import { createElement, useEffect, useState } from 'react';

interface DeferLoadProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  name: string;
  isChildDeferLoad?: boolean;
  isTab: boolean;
  deferLoadId: string;
}

//
// WARNING:  It is not expected that this file should be modified.  It is part of infrastructure code that works with
// Redux and creation/update of Redux containers and PConnect.  Modifying this code could have undesireable results and
// is totally at your own risk.
//

export default function DeferLoad(props: DeferLoadProps) {
  const { getPConnect, name, deferLoadId, isTab } = props;
  const [content, setContent] = useState<any>(null);
  const [isLoading, setLoading] = useState(true);
  const [currentLoadedAssignment, setCurrentLoadedAssignment] = useState('');

  const pConnect = getPConnect();
  const constants = PCore.getConstants();

  const theRequestedAssignment = pConnect.getValue(PCore.getConstants().CASE_INFO.ASSIGNMENT_LABEL, ''); // 2nd arg empty string until typedef allows optional
  if (theRequestedAssignment !== currentLoadedAssignment) {
    // console.log(`DeferLoad: currentLoadedAssignment about to change from ${currentLoadedAssignment} to ${theRequestedAssignment}`);
    setCurrentLoadedAssignment(theRequestedAssignment);
  }

  const { CASE, PAGE, DATA } = constants.RESOURCE_TYPES;
  const loadViewCaseID = pConnect.getValue(constants.PZINSKEY, '') || pConnect.getValue(constants.CASE_INFO.CASE_INFO_ID, ''); // 2nd arg empty string until typedef allows optional
  let containerName;
  let containerItemData;
  const targetName = pConnect.getTarget();
  if (targetName) {
    containerName = PCore.getContainerUtils().getActiveContainerItemName(targetName);

    containerItemData = PCore.getContainerUtils().getContainerItemData(targetName, containerName);
  }

  const { resourceType = CASE } = containerItemData || {
    resourceType: loadViewCaseID ? CASE : PAGE
  };
  const isContainerPreview = /preview_[0-9]*/g.test(pConnect.getContextName());

  const getViewOptions = () =>
    ({
      viewContext: resourceType,
      pageClass: loadViewCaseID ? '' : (pConnect.getDataObject('') as any).pyPortal.classID, // 2nd arg empty string until typedef allows optional
      container: isContainerPreview ? 'preview' : undefined,
      containerName: isContainerPreview ? 'preview' : undefined,
      updateData: isContainerPreview
    }) as any;

  const onResponse = (data) => {
    setLoading(false);
    if (deferLoadId) {
      PCore.getDeferLoadManager().start(
        name,
        getPConnect().getCaseInfo().getKey(),
        getPConnect().getPageReference().replace('caseInfo.content', ''),
        getPConnect().getContextName(),
        deferLoadId
      );
    }

    if (data && !(data.type && data.type === 'error')) {
      const config = {
        meta: data,
        options: {
          context: pConnect.getContextName(),
          pageReference: pConnect.getPageReference()
        }
      };
      const configObject = PCore.createPConnect(config);
      configObject.getPConnect().setInheritedProp('displayMode', 'LABELS_LEFT');
      setContent(createElement(createPConnectComponent(), configObject));
      if (deferLoadId) {
        PCore.getDeferLoadManager().stop(deferLoadId, getPConnect().getContextName());
      }
    }
  };

  useEffect(() => {
    if (resourceType === DATA) {
      // Rendering defer loaded tabs in data context
      if (containerName) {
        const dataContext = PCore.getStoreValue('.dataContext', 'dataInfo', containerName);
        const dataContextParameters = PCore.getStoreValue('.dataContextParameters', 'dataInfo', containerName);

        getPConnect()
          .getActionsApi()
          .showData(name, dataContext, dataContextParameters, {
            // @ts-expect-error - Type 'boolean' is not assignable to type 'string'
            skipSemanticUrl: true,
            // @ts-expect-error
            isDeferLoaded: true
          })
          .then((data) => {
            onResponse(data);
          });
      } else {
        console.error('Cannot load the defer loaded view without container information');
      }
    } else if (resourceType === PAGE) {
      // Rendering defer loaded tabs in case/ page context
      getPConnect()
        .getActionsApi()
        .loadView(encodeURI(loadViewCaseID), name, getViewOptions())
        .then((data) => {
          onResponse(data);
        });
    } else {
      getPConnect()
        .getActionsApi()
        .refreshCaseView(encodeURI(loadViewCaseID), name, '') // 3rd arg empty string until typedef allows optional
        .then((data) => {
          onResponse(data.root);
        });
    }
  }, [name, getPConnect, currentLoadedAssignment]);
  /* TODO Cosmos need to handle for now added a wrapper div with pos relative */
  let deferLoadContent;
  if (isLoading) {
    deferLoadContent = (
      <div className='relative h-[100px]'>
        <div className='text-center'>
          <Loader2 className='mx-auto mt-8 h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      </div>
    );
  } else {
    deferLoadContent = !isTab ? (
      <div className='m-1 p-1'>{content}</div>
    ) : (
      <div id='DeferLoad' className='m-1 rounded-lg border bg-card p-1 shadow-sm'>
        <>{content}</>
      </div>
    );
  }

  return deferLoadContent;
}
