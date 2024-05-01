import { memo, useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';

import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';

import { getUserId, isUserNameAvailable } from './UserReferenceUtils';

const DROPDOWN_LIST = 'Drop-down list';
const SEARCH_BOX = 'Search box';

interface UserReferenceProps extends PConnProps {
  // If any, enter additional props that only exist on URLComponent here
  displayAs?: string;
  label?: string;
  value?: any;
  testId?: string;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  validatemessage?: string;
  showAsFormattedText?: boolean;
  additionalProps?: object;
  hideLabel?: boolean;
  variant?: string;
  onChange?: any;
}

const UserReference = (props: UserReferenceProps) => {
  // Get emitted components from map (so we can get any override that may exist)
  const AutoComplete = getComponentFromMap('AutoComplete');
  const Dropdown = getComponentFromMap('Dropdown');

  const {
    label = '',
    displayAs = '',
    getPConnect,
    value = '',
    testId = '',
    helperText = '',
    validatemessage = '',
    placeholder = '',
    showAsFormattedText = false,
    additionalProps = {},
    hideLabel = false,
    readOnly = false,
    required = false,
    disabled = false,
    onChange,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    variant = 'inline'
  } = props;
  const [dropDownDataSource, setDropDownDataSource] = useState([]);
  const [userName, setUserName] = useState('');
  const OPERATORS_DP = PCore.getEnvironmentInfo().getDefaultOperatorDP();
  const userId = getUserId(value);

  useEffect(() => {
    if (userId && readOnly && showAsFormattedText) {
      if (isUserNameAvailable(value)) {
        setUserName(value.userName);
      } else {
        // if same user ref field is referred in view as editable & readonly formatted text
        // referenced users won't be available, so get user details from dx api
        const { getOperatorDetails } = PCore.getUserApi();
        getOperatorDetails(userId).then((res: any) => {
          if (res.data && res.data.pyOperatorInfo && res.data.pyOperatorInfo.pyUserName) {
            setUserName(res.data.pyOperatorInfo.pyUserName);
          }
        });
      }
    } else if (displayAs === DROPDOWN_LIST) {
      const queryPayload = {
        dataViewName: OPERATORS_DP
      };

      PCore.getRestClient()
        // @ts-ignore - Argument of type '{ queryPayload: { dataViewName: string; }; }' is not assignable to parameter of type 'RestApiOptionsObject'
        // @ts-ignore - Expected 3 arguments, but got 2
        .invokeRestApi('getListData', { queryPayload })
        .then((res: any) => {
          const ddDataSource = res.data.data.map(listItem => ({
            key: listItem.pyUserIdentifier,
            value: listItem.pyUserName
          }));
          setDropDownDataSource(ddDataSource);
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error(err);
        });
    }
  }, [displayAs, readOnly, showAsFormattedText, value]);

  let userReferenceComponent: any = null;

  if (readOnly && showAsFormattedText) {
    if (userId) {
      userReferenceComponent = (
        <>
          {/*
            TODO: This has to be replaced with Operator Component
          */}
          <div>
            <Typography variant='caption'>{label}</Typography>
            <Typography variant='body1'>{userName}</Typography>
          </div>
        </>
      );
    }
  } else {
    if (displayAs === SEARCH_BOX) {
      const columns = [
        {
          value: 'pyUserName',
          display: 'true',
          useForSearch: true,
          primary: 'true'
        },
        {
          value: 'pyUserIdentifier',
          setProperty: 'Associated property',
          key: 'true',
          display: 'true',
          secondary: 'true',
          useForSearch: 'true'
        }
      ];

      userReferenceComponent = (
        <AutoComplete
          additionalProps={additionalProps}
          label={label}
          getPConnect={getPConnect}
          datasource={OPERATORS_DP}
          listType='datapage'
          columns={columns}
          testId={testId}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          required={required}
          helperText={helperText}
          validatemessage={validatemessage}
          value={userId}
          hideLabel={hideLabel}
          onChange={onChange}
        />
      );
    }
    if (displayAs === DROPDOWN_LIST) {
      userReferenceComponent = (
        <Dropdown
          additionalProps={additionalProps}
          datasource={dropDownDataSource}
          listType='associated'
          getPConnect={getPConnect}
          label={label}
          value={userId}
          testId={testId}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          required={required}
          helperText={helperText}
          validatemessage={validatemessage}
          hideLabel={hideLabel}
          onChange={onChange}
        />
      );
    }
  }

  return userReferenceComponent;
};

// as objects are there in props, shallow comparision fails & re-rendering of comp happens even with
// same key value pairs in obj. hence using custom comparison function on when to re-render
const comparisonFn = (prevProps, nextProps) => {
  return (
    getUserId(prevProps.value) === getUserId(nextProps.value) &&
    prevProps.validatemessage === nextProps.validatemessage &&
    prevProps.required === nextProps.required &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.readOnly === nextProps.readOnly
  );
};

export default memo(UserReference, comparisonFn);
