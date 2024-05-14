/* eslint-disable no-console */
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Progress } from '../../../../design-system/ui/progress';

import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { CardContent, CardHeader } from '../../../../design-system/ui/card';

interface MultiStepProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  itemKey: string;
  actionButtons: any[];
  onButtonPress: any;
  arNavigationSteps: any[];
}

export default function MultiStep(props: PropsWithChildren<MultiStepProps>) {
  // Get emitted components from map (so we can get any override that may exist)
  const [progressValue, setProgressValue] = useState(30);
  const AssignmentCard = getComponentFromMap('AssignmentCard');

  const { getPConnect, children, itemKey = '', actionButtons, onButtonPress } = props;
  const { arNavigationSteps } = props;
  const currStepIndex = arNavigationSteps.findIndex(step => {
    return step.visited_status === 'current';
  });
  useEffect(() => {
    setProgressValue(Math.floor(((currStepIndex + 1) / arNavigationSteps.length) * 100));
    console.log('progressValue', Math.floor((currStepIndex / arNavigationSteps.length) * 100));
  }, [currStepIndex]);

  function buttonPress(sAction: string, sButtonType: string) {
    onButtonPress(sAction, sButtonType);
  }

  return (
    <>
      <CardHeader className=''>
        <Progress value={progressValue} />
      </CardHeader>
      <div className=''>
        {/*           {arNavigationSteps.map((mainStep, index) => {
            return (
              <React.Fragment key={mainStep.actionID}>
                <div className=''>
                  <div className=''>
                    <div className=''>
                      <span>{index + 1}</span>
                    </div>
                  </div>
                  <div className=''>
                    <div className='text-center text-2xl'>{mainStep.name}</div>
                  </div>
                </div>
              </React.Fragment>
            );
          })} */}
      </div>
      <CardContent>
        {arNavigationSteps.map(mainStep => {
          return (
            <React.Fragment key={mainStep.actionID}>
              {!mainStep?.steps && mainStep.visited_status === 'current' && (
                <AssignmentCard getPConnect={getPConnect} itemKey={itemKey} actionButtons={actionButtons} onButtonPress={buttonPress}>
                  {children}
                </AssignmentCard>
              )}
            </React.Fragment>
          );
        })}
      </CardContent>
    </>
  );
}
