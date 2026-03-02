/* eslint-disable @typescript-eslint/no-explicit-any */

declare const PCore: any;

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import PConnectRenderer from '../PConnectRenderer';
import type { CustomPConnectProps, PConnectProxy } from '../types';

export default function DeferLoad({ pConnect }: CustomPConnectProps) {
  const configProps = pConnect.resolveConfigProps(pConnect.getConfigProps());
  const name = (configProps.name as string) ?? '';
  const deferLoadId = configProps.deferLoadId as string | undefined;

  const [childPConnect, setChildPConnect] = useState<PConnectProxy | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const context = pConnect.getContextName();
    const pageReference = pConnect.getPageReference();
    const constants = PCore.getConstants();

    const loadViewCaseID =
      pConnect.getValue(constants.PZINSKEY, '') || pConnect.getValue(constants.CASE_INFO.CASE_INFO_ID, '');

    const onResponse = (data: any) => {
      setLoading(false);

      if (deferLoadId) {
        PCore.getDeferLoadManager().start(name, pConnect.getCaseInfo().getKey(), pageReference.replace('caseInfo.content', ''), context, deferLoadId);
      }

      if (data && !(data.type && data.type === 'error')) {
        const config = {
          meta: data,
          options: {
            context,
            pageReference,
          },
        };
        const configObject = PCore.createPConnect(config);
        setChildPConnect(configObject.getPConnect() as PConnectProxy);

        if (deferLoadId) {
          PCore.getDeferLoadManager().stop(deferLoadId, context);
        }
      }
    };

    pConnect
      .getActionsApi()
      .refreshCaseView(encodeURI(loadViewCaseID), name, '')
      .then((data: any) => {
        onResponse(data.root);
      })
      .catch((err: any) => {
        console.error('[CustomPega] DeferLoad: failed to load', name, err);
        setLoading(false);
      });
  }, [name]);

  if (isLoading) {
    return (
      <div data-component='DeferLoad' className='flex items-center justify-center py-6'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!childPConnect) return null;

  return (
    <div data-component='DeferLoad'>
      <PConnectRenderer pConnect={childPConnect} />
    </div>
  );
}
