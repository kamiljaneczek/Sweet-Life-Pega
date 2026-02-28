import Utils from '@pega/react-sdk-components/lib/components/helpers/utils';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import React, { useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '../../../../design-system/ui/popover';

// Operator is one of the few components that does NOT have getPConnect.
//  So, no need to extend PConnProps
interface OperatorProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  label: string;
  createDateTime: string;
  createLabel: string;
  createOperator: { userName: string; userId: string };
  updateDateTime: string;
  updateLabel: string;
  updateOperator: { userName: string; userId: string };
  displayLabel?: any;
}

export default function Operator(props: OperatorProps) {
  // const componentName = "Operator";

  const fieldLabel = props?.label?.toLowerCase();
  const displayLabel = props?.displayLabel?.toLowerCase();
  let caseOpLabel = '---';
  let caseOpName = '---';
  let caseOpId = '';
  let caseTime = '';

  if (fieldLabel === 'create operator' || displayLabel === 'create operator') {
    caseOpLabel = props.createLabel;
    caseOpName = props.createOperator.userName;
    caseTime = props.createDateTime;
    caseOpId = props.createOperator.userId;
  } else if (fieldLabel === 'update operator' || displayLabel === 'update operator') {
    caseOpLabel = props.updateLabel;
    caseOpName = props.updateOperator.userName;
    caseTime = props.updateDateTime;
    caseOpId = props.updateOperator.userId;
  }

  // Popover-related
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverFields, setPopoverFields] = useState<any[]>([]);

  function showOperatorDetails() {
    const operatorPreviewPromise = PCore.getUserApi().getOperatorDetails(caseOpId);
    const localizedVal = PCore.getLocaleUtils().getLocaleValue;
    const localeCategory = 'Operator';

    operatorPreviewPromise.then((res: any) => {
      const fillerString = '---';
      let fields: any = [];
      if (res.data?.pyOperatorInfo?.pyUserName) {
        fields = [
          {
            id: 'pyPosition',
            name: localizedVal('Position', localeCategory),
            value: res.data.pyOperatorInfo.pyPosition ? res.data.pyOperatorInfo.pyPosition : fillerString
          },
          {
            id: 'pyOrganization',
            name: localizedVal('Organization', localeCategory),
            value: res.data.pyOperatorInfo.pyOrganization ? res.data.pyOperatorInfo.pyOrganization : fillerString
          },
          {
            id: 'ReportToUserName',
            name: localizedVal('Reports to', localeCategory),
            value: res.data.pyOperatorInfo.pyReportToUserName ? res.data.pyOperatorInfo.pyReportToUserName : fillerString
          },
          {
            id: 'pyTelephone',
            name: localizedVal('Telephone', localeCategory),
            value: res.data.pyOperatorInfo.pyTelephone ? (
              <a href={`tel:${res.data.pyOperatorInfo.pyTelephone}`}>{res.data.pyOperatorInfo.pyTelephone}</a>
            ) : (
              fillerString
            )
          },
          {
            id: 'pyEmailAddress',
            name: localizedVal('Email address', localeCategory),
            value: res.data.pyOperatorInfo.pyEmailAddress ? (
              <a href={`mailto:${res.data.pyOperatorInfo.pyEmailAddress}`}>{res.data.pyOperatorInfo.pyEmailAddress}</a>
            ) : (
              fillerString
            )
          }
        ];
      } else {
        console.log(
          `Operator: PCore.getUserApi().getOperatorDetails(${caseOpId}); returned empty res.data.pyOperatorInfo.pyUserName - adding default`
        );
        fields = [
          {
            id: 'pyPosition',
            name: localizedVal('Position', localeCategory),
            value: fillerString
          },
          {
            id: 'pyOrganization',
            name: localizedVal('Organization', localeCategory),
            value: fillerString
          },
          {
            id: 'ReportToUserName',
            name: localizedVal('Reports to', localeCategory),
            value: fillerString
          },
          {
            id: 'pyTelephone',
            name: localizedVal('Telephone', localeCategory),
            value: fillerString
          },
          {
            id: 'pyEmailAddress',
            name: localizedVal('Email address', localeCategory),
            value: fillerString
          }
        ];
      }
      // Whatever the fields are, update the component's popoverFields
      setPopoverFields(fields);
    });

    setPopoverOpen(true);
  }

  function getPopoverGrid() {
    if (popoverFields.length === 0) {
      return;
    }

    // There are fields, so build the grid.
    return (
      <div className='p-2 max-w-[45ch]'>
        <div className='mb-2'>
          <h6 className='text-lg font-medium'>{caseOpName}</h6>
        </div>
        {popoverFields.map((field) => {
          return (
            <React.Fragment key={field.id}>
              <div className='flex gap-1 py-0.5'>
                <div className='w-1/2'>
                  <span className='text-xs text-muted-foreground'>{field.name}</span>
                </div>
                <div className='w-1/2'>
                  <span className='text-sm font-medium'>{field.value}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // End of popover-related

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger onClick={showOperatorDetails} className='text-left cursor-pointer bg-transparent border-0 p-0'>
          <div className='flex flex-col'>
            <span className='text-xs text-muted-foreground'>{caseOpLabel}</span>
            <span className='text-sm text-foreground'>{caseOpName}</span>
          </div>
        </PopoverTrigger>
        <PopoverContent align='center' side='bottom'>
          {getPopoverGrid()}
        </PopoverContent>
      </Popover>
      <br />
      {Utils.generateDateTime(caseTime, 'DateTime-Since')}
    </>
  );
}
