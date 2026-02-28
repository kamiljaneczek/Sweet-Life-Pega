import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';

import { getToDoAssignments } from '@pega/react-sdk-components/lib/components/infra/Containers/FlowContainer/helpers';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { PropsWithChildren, useState } from 'react';
import { Button } from '../../../../design-system/ui/button';
import { Card } from '../../../../design-system/ui/card';

interface ConfirmationProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  datasource: { source: any };
  label: string;
  showLabel: boolean;
  showTasks: boolean;
}

export default function Confirmation(props: PropsWithChildren<ConfirmationProps>) {
  // Get emitted components from map (so we can get any override that may exist)
  const ToDo = getComponentFromMap('Todo'); // NOTE: ConstellationJS Engine uses "Todo" and not "ToDo"!!!
  const Details = getComponentFromMap('Details');

  const CONSTS = PCore.getConstants();
  const [showConfirmView, setShowConfirmView] = useState(true);
  const { showTasks, getPConnect } = props;
  // Get the inherited props from the parent to determine label settings
  // Not using whatsNext at the moment, need to figure out the use of it
  // const whatsNext = datasource?.source;
  // const items = whatsNext.length > 0 ? whatsNext.map(item => item.label) : '';
  const activeContainerItemID = PCore.getContainerUtils().getActiveContainerItemName(getPConnect().getTarget() ?? null);
  const rootInfo = PCore.getContainerUtils().getContainerItemData(getPConnect().getTarget(), activeContainerItemID);
  const onConfirmViewClose = () => {
    setShowConfirmView(false);
    PCore.getPubSubUtils().publish(PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CLOSE_CONFIRM_VIEW, rootInfo);
  };
  const todoProps = { ...props, renderTodoInConfirm: true };
  const toDoList = getToDoAssignments(getPConnect());
  const detailProps = { ...props, showLabel: false };
  const showDetails = detailProps?.children?.[0]?.props?.getPConnect()?.getChildren()?.length > 0;
  return showConfirmView ? (
    <Card className='m-1 p-1'>
      <h2 id='confirm-label'>{props.showLabel ? props.label : ''}</h2>
      {showDetails ? <Details {...detailProps} /> : undefined}
      {showTasks ? (
        toDoList && toDoList.length > 0 ? (
          <ToDo {...todoProps} datasource={{ source: toDoList }} getPConnect={getPConnect} type={CONSTS.TODO} headerText='Open Tasks' isConfirm />
        ) : undefined
      ) : undefined}
      <div className='flex justify-end'>
        <Button onClick={onConfirmViewClose}>Done</Button>
      </div>
    </Card>
  ) : toDoList && toDoList.length > 0 ? (
    <Card className='m-1 p-1'>
      <ToDo {...props} datasource={{ source: toDoList }} getPConnect={getPConnect} type={CONSTS.TODO} headerText='Tasks' isConfirm />
    </Card>
  ) : null;
}
