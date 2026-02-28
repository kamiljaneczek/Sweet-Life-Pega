import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';

import { buildMetaForListView, getContext } from '@pega/react-sdk-components/lib/components/helpers/simpleTableHelpers';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { useRef } from 'react';

// Can't use SimpleTableProps until getComponentConfig() and getFieldMetadata() are NOT private
interface SimpleTableProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  multiRecordDisplayAs: string;
  allowTableEdit: boolean;
  contextClass: any;
  label: string;
  propertyLabel?: string;
  displayMode?: string;
  fieldMetadata?: any;
  hideLabel?: boolean;
  parameters?: any;
  isDataObject?: boolean;
  type?: string;
  ruleClass?: string;
  authorContext?: string;
  name?: string;
}

export default function SimpleTable(props: SimpleTableProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const ListView = getComponentFromMap('ListView');
  const FieldGroupTemplate = getComponentFromMap('FieldGroupTemplate');
  const SimpleTableManual = getComponentFromMap('SimpleTableManual');
  const refToPConnect = useRef<any>(null);

  const {
    getPConnect,
    multiRecordDisplayAs,
    allowTableEdit,
    label: labelProp,
    propertyLabel,
    displayMode,
    fieldMetadata,
    hideLabel,
    parameters,
    isDataObject,
    type,
    ruleClass,
    authorContext,
    name
  } = props;

  let { contextClass } = props;
  if (!contextClass) {
    // @ts-expect-error - Property 'getComponentConfig' is private and only accessible within class 'C11nEnv'.
    let listName = getPConnect().getComponentConfig().referenceList;
    listName = PCore.getAnnotationUtils().getPropertyName(listName);
    // was... contextClass = getPConnect().getFieldMetadata(listName)?.pageClass;
    // @ts-expect-error - Property 'getFieldMetadata' is private and only accessible within class 'C11nEnv'.
    const theFieldMetadata = getPConnect().getFieldMetadata(listName);
    if (theFieldMetadata) {
      contextClass = theFieldMetadata.pageClass;
    } else {
      contextClass = undefined;
    }
  }
  if (multiRecordDisplayAs === 'fieldGroup') {
    const fieldGroupProps = { ...props, contextClass };
    return <FieldGroupTemplate {...fieldGroupProps} />;
  }

  const label = labelProp || propertyLabel;
  const propsToUse = { label, ...getPConnect().getInheritedProps() };
  const isDisplayModeEnabled = displayMode === 'DISPLAY_ONLY';

  if (fieldMetadata && fieldMetadata.type === 'Page List' && fieldMetadata.dataRetrievalType === 'refer') {
    const {
      children: [{ children: rawFields }],
      parameters: rawParams
    } = (getPConnect().getRawMetadata() as any).config;
    if (isDisplayModeEnabled && hideLabel) {
      propsToUse.label = '';
    }

    const metaForListView = buildMetaForListView(
      fieldMetadata,
      rawFields,
      type,
      ruleClass,
      name,
      propsToUse.label,
      isDataObject,
      parameters // resolved params
    );

    const metaForPConnect = JSON.parse(JSON.stringify(metaForListView));
    // @ts-expect-error - PCore.getMetadataUtils().getPropertyMetadata - An argument for 'currentClassID' was not provided.
    metaForPConnect.config.parameters = rawParams ?? PCore.getMetadataUtils().getPropertyMetadata(name)?.datasource?.parameters;

    const { referenceListStr: referenceList } = getContext(getPConnect());
    let requiredContextForQueryInDisplayMode = {};
    if (isDisplayModeEnabled) {
      requiredContextForQueryInDisplayMode = {
        referenceList
      };
    }
    const options = {
      context: getPConnect().getContextName(),
      pageReference: getPConnect().getPageReference(),
      ...requiredContextForQueryInDisplayMode
    };

    if (!refToPConnect.current) {
      refToPConnect.current = PCore.createPConnect({ meta: metaForPConnect, options }).getPConnect; // getPConnect should be created only once.
    }
    /* BUG-637178 : need to send context */
    const listViewProps = {
      ...metaForListView.config,
      getPConnect: refToPConnect.current,
      displayMode,
      fieldName: authorContext,
      bInForm: true
    };
    return <ListView {...listViewProps} />;
  }
  const simpleTableManualProps: any = { ...props, contextClass };
  if (allowTableEdit === false) {
    simpleTableManualProps.hideAddRow = true;
    simpleTableManualProps.hideDeleteRow = true;
    simpleTableManualProps.disableDragDrop = true;
  }
  return <SimpleTableManual {...simpleTableManualProps} />;
}
