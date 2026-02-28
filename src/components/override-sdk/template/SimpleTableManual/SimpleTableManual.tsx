import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';
import { getDataPage } from '@pega/react-sdk-components/lib/components/helpers/data_page';
import { getReferenceList } from '@pega/react-sdk-components/lib/components/helpers/field-group-utils';
import { format } from '@pega/react-sdk-components/lib/components/helpers/formatters';
import { buildFieldsForTable, filterData, getContext } from '@pega/react-sdk-components/lib/components/helpers/simpleTableHelpers';
import { Utils } from '@pega/react-sdk-components/lib/components/helpers/utils';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { ChevronDown, ChevronUp, FileText, Filter, MoreVertical } from 'lucide-react';
import React, { createElement, PropsWithChildren, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Button } from '../../../../design-system/ui/button';

interface SimpleTableManualProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  hideAddRow?: boolean;
  hideDeleteRow?: boolean;
  referenceList?: any[];
  renderMode?: string;
  presets?: any[];
  label?: string;
  showLabel?: boolean;
  dataPageName?: string;
  contextClass?: string;
  propertyLabel?: string;
  fieldMetadata?: any;
  editMode?: string;
  addAndEditRowsWithin?: any;
  viewForAddAndEditModal?: any;
  editModeConfig?: any;
  displayMode?: string;
  useSeparateViewForEdit: any;
  viewForEditModal: any;
}

let menuColumnId = '';
let menuColumnType = '';
let menuColumnLabel = '';

const filterByColumns: any[] = [];
let myRows: any[];

export default function SimpleTableManual(props: PropsWithChildren<SimpleTableManualProps>) {
  const {
    getPConnect,
    referenceList = [], // if referenceList not in configProps$, default to empy list
    children,
    renderMode,
    presets,
    label: labelProp,
    showLabel,
    dataPageName,
    contextClass,
    hideAddRow,
    hideDeleteRow,
    propertyLabel,
    fieldMetadata,
    editMode,
    addAndEditRowsWithin,
    viewForAddAndEditModal,
    editModeConfig,
    displayMode,
    useSeparateViewForEdit,
    viewForEditModal
  } = props;
  const pConn = getPConnect();
  const [rowData, setRowData] = useState([]);
  const [elements, setElementsData] = useState([]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof any>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [editAnchorEl, setEditAnchorEl] = useState<null | HTMLElement>(null);
  const [editMenuPosition, setEditMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [filterBy, setFilterBy] = useState<string>();
  const [containsDateOrTime, setContainsDateOrTime] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('string');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [displayDialogFilterName, setDisplayDialogFilterName] = useState<string>('');
  const [displayDialogContainsFilter, setDisplayDialogContainsFilter] = useState<string>('contains');
  const [displayDialogContainsValue, setDisplayDialogContainsValue] = useState<string>('');
  const [displayDialogDateFilter, setDisplayDialogDateFilter] = useState<string>('notequal');
  const [displayDialogDateValue, setDisplayDialogDateValue] = useState<string>('');
  const selectedRowIndex: any = useRef(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const editMenuRef = useRef<HTMLDivElement>(null);

  const parameters = fieldMetadata?.datasource?.parameters;
  const { referenceListStr } = getContext(getPConnect());
  const label = labelProp || propertyLabel;
  const propsToUse = { label, showLabel, ...getPConnect().getInheritedProps() };
  if (propsToUse.showLabel === false) {
    propsToUse.label = '';
  }
  // Getting current context
  const context = getPConnect().getContextName();
  const resolvedList = getReferenceList(pConn);
  pConn.setReferenceList(resolvedList);
  const menuIconOverride$ = Utils.getImageSrc('trash', Utils.getSDKStaticConentUrl());

  const resolvedFields = children?.[0]?.children || presets?.[0].children?.[0].children;
  // NOTE: props has each child.config with datasource and value undefined
  //  but getRawMetadata() has each child.config with datasource and value showing their unresolved values (ex: "@P thePropName")
  //  We need to use the prop name as the "glue" to tie the table dataSource, displayColumns and data together.
  //  So, in the code below, we'll use the unresolved config.value (but replacing the space with an underscore to keep things happy)
  const rawMetadata: any = getPConnect().getRawMetadata();

  // get raw config since @P and other annotations are processed and don't appear in the resolved config.
  //  Destructure "raw" children into array var: "rawFields"
  //  NOTE: when config.listType == "associated", the property can be found in either
  //    config.value (ex: "@P .DeclarantChoice") or
  //    config.datasource (ex: "@ASSOCIATED .DeclarantChoice")
  //  Neither of these appear in the resolved props

  const rawConfig = rawMetadata?.config;
  const rawFields = rawConfig?.children?.[0]?.children || rawConfig?.presets?.[0].children?.[0]?.children;
  const isDisplayModeEnabled = displayMode === 'DISPLAY_ONLY';
  const readOnlyMode = renderMode === 'ReadOnly';
  const editableMode = renderMode === 'Editable';
  const showAddRowButton = !readOnlyMode && !hideAddRow;
  const allowEditingInModal =
    (editMode ? editMode === 'modal' : addAndEditRowsWithin === 'modal') && !(renderMode === 'ReadOnly' || isDisplayModeEnabled);
  const showDeleteButton = editableMode && !hideDeleteRow;
  const defaultView = editModeConfig ? editModeConfig.defaultView : viewForAddAndEditModal;
  const bUseSeparateViewForEdit = editModeConfig ? editModeConfig.useSeparateViewForEdit : useSeparateViewForEdit;
  const editView = editModeConfig ? editModeConfig.editView : viewForEditModal;

  const fieldsWithPropNames = rawFields.map((field, index) => {
    return { ...resolvedFields[index], propName: field.config.value.replace('@P .', '') };
  });

  useEffect(() => {
    if (editableMode && !allowEditingInModal) {
      buildElementsForTable();
    }
  }, [referenceList.length]);

  useEffect(() => {
    if (readOnlyMode || allowEditingInModal) {
      generateRowsData();
    }
  }, [referenceList]);

  // Click-outside handler for column menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAnchorEl(null);
        setMenuPosition(null);
      }
      if (editMenuRef.current && !editMenuRef.current.contains(event.target as Node)) {
        setEditAnchorEl(null);
        setEditMenuPosition(null);
      }
    }
    if (anchorEl || editAnchorEl) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [anchorEl, editAnchorEl]);

  // fieldDefs will be an array where each entry will have a "name" which will be the
  //  "resolved" property name (that we can use as the colId) though it's not really
  //  resolved. The buildFieldsForTable helper just removes the "@P " (which is what
  //  Constellation DX Components do). It will also have the "label", and "meta" contains the original,
  //  unchanged config info. For now, much of the info here is carried over from
  //  Constellation DX Components.
  const fieldDefs = buildFieldsForTable(rawFields, pConn, showDeleteButton, { primaryFieldsViewIndex: 0, fields: resolvedFields });

  useLayoutEffect(() => {
    if (allowEditingInModal) {
      getPConnect()
        .getListActions()
        .initDefaultPageInstructions(
          getPConnect().getReferenceList(),
          fieldDefs.filter((item) => item.name).map((item) => item.name)
        );
    } else {
      // @ts-expect-error - An argument for 'fields' was not provided
      getPConnect().getListActions().initDefaultPageInstructions(getPConnect().getReferenceList());
    }
  }, []);

  const displayedColumns = fieldDefs.map((field) => {
    return field.name ? field.name : field.cellRenderer;
  });

  const getFormattedValue = (val, key) => {
    const rawField = fieldsWithPropNames.find((item) => item.propName === key);
    let options = {};
    if (rawField && ['Boolean', 'Checkbox'].includes(rawField.type)) {
      const { trueLabel, falseLabel } = rawField.config;
      options = {
        trueLabel,
        falseLabel
      };
    }
    return rawField ? format(val, rawField.type, options) : val;
  };

  // console.log(`SimpleTable displayedColumns:`);
  // console.log(displayedColumns);

  // return the value that should be shown as the contents for the given row data
  //  of the given row field
  function getRowValue(inRowData: object, inColKey: string): any {
    // See what data (if any) we have to display
    const refKeys: string[] = inColKey?.split('.');
    let valBuilder = inRowData;
    for (const key of refKeys) {
      valBuilder = valBuilder[key];
    }
    return getFormattedValue(valBuilder, inColKey);
  }

  const formatRowsData = (data) => {
    if (!data) return {};

    return data.map((item) => {
      return displayedColumns.reduce((dataForRow, colKey) => {
        dataForRow[colKey] = getRowValue(item, colKey);
        return dataForRow;
      }, {});
    });
  };

  function generateRowsData() {
    // if referenceList is empty and dataPageName property value exists then make a datapage fetch call and get the list of data.
    if (!referenceList.length && dataPageName) {
      getDataPage(dataPageName, parameters, context).then((listData) => {
        const data = formatRowsData(listData);
        myRows = data;
        setRowData(data);
      });
    } else {
      // The referenceList prop has the JSON data for each row to be displayed
      //  in the table. So, iterate over referenceList to create the dataRows that
      //  we're using as the table's dataSource
      const data: any = [];
      for (const row of referenceList) {
        const dataForRow: object = {};
        for (const col of displayedColumns) {
          const colKey: string = col;
          const theVal = getRowValue(row, colKey);
          dataForRow[colKey] = theVal || '';
        }
        data.push(dataForRow);
        myRows = data;
      }
      setRowData(data);
    }
  }

  // May be useful for debugging or understanding how it works.
  // These are the data structures referred to in the html file.
  //  These are the relationships that make the table work
  //  displayedColumns: key/value pairs where key is order of column and
  //    value is the property shown in that column. Ex: 1: "FirstName"
  //  rowData: array of each row's key/value pairs. Inside each row,
  //    each key is an entry in displayedColumns: ex: "FirstName": "Charles"
  //    Ex: { 1: {config: {label: "First Name", readOnly: true: name: "FirstName"}}, type: "TextInput" }
  //    The "type" indicates the type of component that should be used for editing (when editing is enabled)
  //
  // console.log("SimpleTable displayedColumns:");
  // console.log(displayedColumns);
  // console.log(`SimpleTable rowData (${rowData.length} row(s)):`);
  // console.log(JSON.stringify(rowData));

  const addRecord = () => {
    if (allowEditingInModal && defaultView) {
      pConn
        .getActionsApi()
        .openEmbeddedDataModal(
          defaultView,
          pConn as any,
          referenceListStr,
          referenceList.length,
          PCore.getConstants().RESOURCE_STATUS.CREATE,
          '',
          '',
          ''
        );
    } else {
      pConn.getListActions().insert({ classID: contextClass }, referenceList.length);
    }

    getPConnect().clearErrorMessages({
      property: (getPConnect().getStateProps() as any)?.referenceList?.substring(1)
    } as any);
  };

  const editRecord = () => {
    setEditAnchorEl(null);
    setEditMenuPosition(null);
    if (typeof selectedRowIndex.current === 'number') {
      pConn
        .getActionsApi()
        .openEmbeddedDataModal(
          bUseSeparateViewForEdit ? editView : defaultView,
          pConn as any,
          referenceListStr,
          selectedRowIndex.current,
          PCore.getConstants().RESOURCE_STATUS.UPDATE,
          '',
          '',
          ''
        );
    }
  };

  const deleteRecord = () => {
    setEditAnchorEl(null);
    setEditMenuPosition(null);
    pConn.getListActions().deleteEntry(selectedRowIndex.current);
  };

  const deleteRecordFromInlineEditable = (index: number) => {
    pConn.getListActions().deleteEntry(index);
  };

  function buildElementsForTable() {
    const eleData: any = [];
    referenceList.forEach((_element, index) => {
      const data: any = [];
      rawFields.forEach((item) => {
        // removing label field from config to hide title in the table cell
        item = { ...item, config: { ...item.config, label: '' } };
        const referenceListData = getReferenceList(pConn);
        const isDatapage = referenceListData.startsWith('D_');
        const pageReferenceValue = isDatapage
          ? `${referenceListData}[${index}]`
          : `${pConn.getPageReference()}${referenceListData.substring(referenceListData.lastIndexOf('.'))}[${index}]`;
        const config = {
          meta: item,
          options: {
            context,
            pageReference: pageReferenceValue,
            referenceList: referenceListData,
            hasForm: true
          }
        };
        const view = PCore.createPConnect(config);
        data.push(createElement(createPConnectComponent(), view));
      });
      eleData.push(data);
    });
    setElementsData(eleData);
  }

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof any) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property: keyof any) => (event: React.MouseEvent<unknown>) => {
    handleRequestSort(event, property);
  };

  function descendingComparator<T>(a: T, b: T, orderedBy: keyof T) {
    if (b[orderedBy] < a[orderedBy]) {
      return -1;
    }
    if (b[orderedBy] > a[orderedBy]) {
      return 1;
    }
    return 0;
  }

  type Order = 'asc' | 'desc';

  function getComparator<Key extends keyof any>(
    theOrder: Order,
    orderedBy: Key
  ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return theOrder === 'desc' ? (a, b) => descendingComparator(a, b, orderedBy) : (a, b) => -descendingComparator(a, b, orderedBy);
  }

  function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });

    return stabilizedThis.map((el) => el[0]);
  }

  function _menuClick(event, columnId: string, columnType: string, labelValue: string) {
    menuColumnId = columnId;
    menuColumnType = columnType;
    menuColumnLabel = labelValue;

    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom, left: rect.left });
    setAnchorEl(event.currentTarget);
  }

  function editMenuClick(event, index) {
    selectedRowIndex.current = index;
    const rect = event.currentTarget.getBoundingClientRect();
    setEditMenuPosition({ top: rect.bottom, left: rect.left });
    setEditAnchorEl(event.currentTarget);
  }

  function _filterMenu() {
    setAnchorEl(null);
    setMenuPosition(null);

    let bFound = false;

    for (const filterObj of filterByColumns) {
      if (filterObj.ref === menuColumnId) {
        setFilterBy(menuColumnLabel);
        if (filterObj.type === 'Date' || filterObj.type === 'DateTime' || filterObj.type === 'Time') {
          setContainsDateOrTime(true);
          setFilterType(filterObj.type);
          setDisplayDialogDateFilter(filterObj.containsFilter);
          setDisplayDialogDateValue(filterObj.containsFilterValue);
        } else {
          setContainsDateOrTime(false);
          setFilterType('string');
          setDisplayDialogContainsFilter(filterObj.containsFilter);
          setDisplayDialogContainsValue(filterObj.containsFilterValue);
        }
        bFound = true;
        break;
      }
    }

    if (!bFound) {
      setFilterBy(menuColumnLabel);
      setDisplayDialogFilterName(menuColumnId);
      setDisplayDialogContainsValue('');

      switch (menuColumnType) {
        case 'Date':
        case 'DateTime':
        case 'Time':
          setContainsDateOrTime(true);
          setFilterType(menuColumnType);
          break;
        default:
          setContainsDateOrTime(false);
          setFilterType('string');
          break;
      }
    }

    // open dialog
    setOpen(true);
  }

  function _groupMenu() {}

  function _closeDialog() {
    setOpen(false);
  }

  function _dialogContainsFilter(event) {
    setDisplayDialogContainsFilter(event.target.value);
  }

  function _dialogContainsValue(event) {
    setDisplayDialogContainsValue(event.target.value);
  }

  function _dialogDateFilter(event) {
    setDisplayDialogDateFilter(event.target.value);
  }

  function _dialogDateValue(event) {
    setDisplayDialogDateValue(event.target.value);
  }

  function filterSortGroupBy() {
    // get original data set
    let theData: any = myRows.slice();

    // last filter config data is global
    theData = theData.filter(filterData(filterByColumns));

    // move data to array and then sort
    setRowData(theData);
  }

  function updateFilterWithInfo() {
    let bFound = false;
    for (const filterObj of filterByColumns) {
      if (filterObj.ref === menuColumnId) {
        filterObj.type = filterType;
        if (containsDateOrTime) {
          filterObj.containsFilter = displayDialogDateFilter;
          filterObj.containsFilterValue = displayDialogDateValue;
        } else {
          filterObj.containsFilter = displayDialogContainsFilter;
          filterObj.containsFilterValue = displayDialogContainsValue;
        }
        bFound = true;
        break;
      }
    }

    if (!bFound) {
      // add in
      const filterObj: any = {};
      filterObj.ref = menuColumnId;
      filterObj.type = filterType;
      if (containsDateOrTime) {
        filterObj.containsFilter = displayDialogDateFilter;
        filterObj.containsFilterValue = displayDialogDateValue;
      } else {
        filterObj.containsFilter = displayDialogContainsFilter;
        filterObj.containsFilterValue = displayDialogContainsValue;
      }

      filterByColumns.push(filterObj);
    }
  }

  function _submitFilter() {
    updateFilterWithInfo();
    filterSortGroupBy();

    setOpen(false);
  }

  function _showFilteredIcon(columnId) {
    for (const filterObj of filterByColumns) {
      if (filterObj.ref === columnId) {
        if (filterObj.containsFilterValue !== '') {
          return true;
        }
        return false;
      }
    }

    return false;
  }

  function results() {
    const len = editableMode ? elements.length : rowData.length;

    return len ? (
      <span className='text-sm opacity-70'>
        {len} result{len > 1 ? 's' : ''}
      </span>
    ) : null;
  }

  return (
    <>
      <div className='my-1 rounded border border-gray-200 bg-white shadow-sm' id='simple-table-manual'>
        {propsToUse.label && (
          <h3 className='m-2'>
            {propsToUse.label} {results()}
          </h3>
        )}
        <table className='w-full border-collapse text-left text-sm'>
          <thead className='bg-gray-100'>
            <tr>
              {fieldDefs.map((field: any, index) => {
                return (
                  <th key={`head-${displayedColumns[index]}`} className='border-r border-gray-300 p-2 text-left font-semibold'>
                    {readOnlyMode ? (
                      <div className='flex items-center'>
                        <button
                          type='button'
                          className='inline-flex cursor-pointer items-center gap-1 bg-transparent border-none p-0 font-semibold'
                          onClick={createSortHandler(displayedColumns[index])}
                        >
                          {field.label}
                          {orderBy === displayedColumns[index] ? (
                            order === 'desc' ? (
                              <ChevronDown className='inline-block h-4 w-4 align-bottom' />
                            ) : (
                              <ChevronUp className='inline-block h-4 w-4 align-bottom' />
                            )
                          ) : null}
                          {_showFilteredIcon(field.name) && <Filter className='inline-block h-4 w-4 align-bottom' />}
                          {orderBy === displayedColumns[index] ? (
                            <span className='sr-only'>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</span>
                          ) : null}
                        </button>
                        <button
                          type='button'
                          id='menu-icon'
                          className='ml-1 inline-flex cursor-pointer items-center bg-transparent border-none p-0'
                          onClick={(event) => {
                            _menuClick(event, field.name, field.meta.type, field.label);
                          }}
                        >
                          <MoreVertical className='h-4 w-4 align-bottom' />
                        </button>
                      </div>
                    ) : (
                      field.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {editableMode &&
              elements.map((row: any, index) => {
                const theKey = `row-${index}`;
                return (
                  <tr key={theKey} className='border-b border-gray-200'>
                    {row.map((item, childIndex) => {
                      const theColKey = `data-${index}-${childIndex}`;
                      return (
                        <td key={theColKey} className='border-r border-gray-300 p-2'>
                          {item}
                        </td>
                      );
                    })}
                    {showDeleteButton && (
                      <td className='p-2'>
                        <button
                          type='button'
                          className='psdk-utility-button'
                          id='delete-button'
                          aria-label='Delete Cell'
                          onClick={() => deleteRecordFromInlineEditable(index)}
                        >
                          <img className='psdk-utility-card-action-svg-icon' src={menuIconOverride$} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            {(readOnlyMode || allowEditingInModal) &&
              rowData &&
              rowData.length > 0 &&
              stableSort(rowData, getComparator(order, orderBy))
                .slice(0)
                .map((row, index) => {
                  return (
                    <tr key={index} className='border-b border-gray-200 hover:bg-gray-50'>
                      {displayedColumns.map((colKey) => {
                        return (
                          <td key={colKey} className='border-r border-gray-300 p-2'>
                            {showDeleteButton && colKey === 'DeleteIcon' ? (
                              <div>
                                <button
                                  type='button'
                                  id='table-edit-menu-icon'
                                  className='inline-flex cursor-pointer items-center bg-transparent border-none p-0'
                                  onClick={(event) => {
                                    editMenuClick(event, index);
                                  }}
                                >
                                  <MoreVertical className='h-4 w-4 align-bottom' />
                                </button>
                                {Boolean(editAnchorEl) && editMenuPosition && (
                                  <div
                                    ref={editMenuRef}
                                    id='table-edit-menu'
                                    className='fixed z-50 min-w-[120px] rounded border border-gray-200 bg-white py-1 shadow-lg'
                                    style={{ top: editMenuPosition.top, left: editMenuPosition.left }}
                                  >
                                    <button
                                      type='button'
                                      className='block w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-100'
                                      onClick={() => editRecord()}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type='button'
                                      className='block w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-100'
                                      onClick={() => deleteRecord()}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : typeof row[colKey] === 'boolean' && !row[colKey] ? (
                              'False'
                            ) : typeof row[colKey] === 'boolean' && row[colKey] ? (
                              'True'
                            ) : (
                              row[colKey]
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
          </tbody>
        </table>
        {readOnlyMode && rowData && rowData.length === 0 && (
          <div className='no-records' id='no-records'>
            No records found.
          </div>
        )}
        {editableMode && referenceList && referenceList.length === 0 && (
          <div className='no-records' id='no-records'>
            No records found.
          </div>
        )}
      </div>
      {showAddRowButton && (
        <div className='text-base'>
          <button
            type='button'
            className='cursor-pointer bg-transparent border-none text-primary underline-offset-4 hover:underline p-0'
            onClick={addRecord}
          >
            + Add
          </button>
        </div>
      )}
      {Boolean(anchorEl) && menuPosition && (
        <div
          ref={menuRef}
          id='simple-menu'
          className='fixed z-50 min-w-[140px] rounded border border-gray-200 bg-white py-1 shadow-lg'
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <button
            type='button'
            className='flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100'
            onClick={_filterMenu}
          >
            <Filter className='h-4 w-4' /> Filter
          </button>
          <button
            type='button'
            className='flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100'
            onClick={_groupMenu}
          >
            <FileText className='h-4 w-4' /> Group
          </button>
        </div>
      )}
      {open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50' onClick={_closeDialog}>
          <div className='w-full max-w-md rounded-lg bg-white shadow-xl' onClick={(e) => e.stopPropagation()}>
            <div className='border-b border-gray-200 px-6 py-4'>
              <h2 className='text-lg font-semibold'>Filter: {filterBy}</h2>
            </div>
            <div className='px-6 py-4'>
              {containsDateOrTime ? (
                <>
                  <select
                    className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                    value={displayDialogDateFilter}
                    onChange={_dialogDateFilter}
                  >
                    <option value='notequal'>is not equal to</option>
                    <option value='equal'>is equal to</option>
                    <option value='after'>after</option>
                    <option value='before'>before</option>
                    <option value='null'>is null</option>
                    <option value='notnull'>is not null</option>
                  </select>
                  {filterType === 'Date' && (
                    <input
                      autoFocus
                      className='mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                      id='containsFilter'
                      type='date'
                      value={displayDialogDateValue}
                      onChange={_dialogDateValue}
                    />
                  )}
                  {filterType === 'DateTime' && (
                    <input
                      autoFocus
                      className='mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                      id='containsFilter'
                      type='datetime-local'
                      value={displayDialogDateValue}
                      onChange={_dialogDateValue}
                    />
                  )}
                  {filterType === 'Time' && (
                    <input
                      autoFocus
                      className='mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                      id='containsFilter'
                      type='time'
                      value={displayDialogDateValue}
                      onChange={_dialogDateValue}
                    />
                  )}
                </>
              ) : (
                <>
                  <select
                    id='filter'
                    className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                    onChange={_dialogContainsFilter}
                    value={displayDialogContainsFilter}
                  >
                    <option value='contains'>Contains</option>
                    <option value='equals'>Equals</option>
                    <option value='startswith'>Starts with</option>
                  </select>
                  <input
                    autoFocus
                    className='mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                    id='containsFilter'
                    type='text'
                    value={displayDialogContainsValue}
                    onChange={_dialogContainsValue}
                  />
                </>
              )}
            </div>
            <div className='flex justify-end gap-2 border-t border-gray-200 px-6 py-4'>
              <Button variant='secondary' onClick={_closeDialog}>
                Cancel
              </Button>
              <Button onClick={_submitFilter}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
