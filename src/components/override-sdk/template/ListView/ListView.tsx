import { filterData } from '@pega/react-sdk-components/lib/components/helpers/simpleTableHelpers';
import { ChevronDown, ChevronUp, FileText, Filter, MoreVertical, Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import './ListView.css';
import { getCurrencyOptions } from '@pega/react-sdk-components/lib/components/field/Currency/currency-utils';
import { getDateFormatInfo } from '@pega/react-sdk-components/lib/components/helpers/date-format-utils';
import { format } from '@pega/react-sdk-components/lib/components/helpers/formatters';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { Button } from '../../../../design-system/ui/button';
import { Checkbox } from '../../../../design-system/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../design-system/ui/select';
import useInit from './hooks';

interface ListViewProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  bInForm?: boolean;
  globalSearch?: boolean;
  referenceList?: any[];
  // rowClickAction?: any;
  selectionMode?: string;
  referenceType?: string;
  payload?: any;
  parameters?: any;
  compositeKeys?: any;
  showDynamicFields?: boolean;
  readonlyContextList?: any;
  value: any;
}

const SELECTION_MODE = { SINGLE: 'single', MULTI: 'multi' };

let myRows: any[];
let myDisplayColumnList: any[];

let menuColumnId = '';
let menuColumnType = '';
let menuColumnLabel = '';

let sortColumnId: any;

const filterByColumns: any[] = [];

export default function ListView(props: ListViewProps) {
  const { getPConnect, bInForm = true } = props;
  const {
    globalSearch,
    referenceList,
    /* rowClickAction, */
    selectionMode,
    referenceType,
    payload,
    parameters,
    compositeKeys,
    showDynamicFields,
    readonlyContextList: selectedValues,
    value
  } = props;
  const ref = useRef({}).current;
  const cosmosTableRef = useRef();
  // List component context
  const [listContext, setListContext] = useState<any>({});
  const { meta } = listContext;
  // getXRayRuntime was removed in SDK 25.1 - using no-op fallback
  const xRayApis = (PCore.getDebugger() as any).getXRayRuntime?.() ?? { startXRay: () => '' };
  const xRayUid = xRayApis.startXRay();

  useInit({
    ...props,
    setListContext,
    ref,
    showDynamicFields,
    xRayUid,
    cosmosTableRef
  });

  const thePConn = getPConnect();
  // @ts-expect-error - Property 'getComponentConfig' is private and only accessible within class 'C11nEnv'.
  const componentConfig = thePConn.getComponentConfig();
  const resolvedConfigProps: any = thePConn.getConfigProps() as ListViewProps;

  /** By default, pyGUID is used for Data classes and pyID is for Work classes as row-id/key */
  const defRowID = referenceType === 'Case' ? 'pyID' : 'pyGUID';

  /** If compositeKeys is defined, use dynamic value, else fallback to pyID or pyGUID. */
  const rowID = compositeKeys && compositeKeys?.length === 1 ? compositeKeys[0] : defRowID;

  const [arRows, setRows] = useState<any[]>([]);
  const [arColumns, setColumns] = useState<any[]>([]);
  const [response, setResponse] = useState<any[]>([]);

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof any>('');

  const [menuAnchor, setMenuAnchor] = useState<{ top: number; left: number } | null>(null);
  const [open, setOpen] = useState(false);

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const snackbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedValue, setSelectedValue] = useState(value);

  // This basically will hold the list of all current filters
  const filters = useRef({});

  // Will contain the list of columns specific for an instance
  const columnList: any = useRef([]);
  const filterPayload: any = useRef();
  // Will be sent in the dashboardFilterPayload
  let selectParam: any[] = [];

  // dataview parameters coming from the ListPage
  // This constant will also be used for parameters coming from from other components/utility functions in future
  const dataViewParameters = parameters;

  // Ref for menu click-outside detection
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showSnackbar) {
      snackbarTimerRef.current = setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);
    }
    return () => {
      if (snackbarTimerRef.current) {
        clearTimeout(snackbarTimerRef.current);
      }
    };
  }, [showSnackbar]);

  // Click-outside handler for the column menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAnchor(null);
      }
    }
    if (menuAnchor) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuAnchor]);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof any) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property: keyof any) => (event: React.MouseEvent<unknown>) => {
    sortColumnId = property;
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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (value: string) => {
    setRowsPerPage(+value);
    setPage(0);
  };

  const AssignDashObjects = ['Assign-Worklist', 'Assign-WorkBasket'];
  function getHeaderCells(colFields, fields) {
    return colFields.map((field: any, index) => {
      let theField = field.config.value.substring(field.config.value.indexOf(' ') + 1);
      if (theField.indexOf('.') === 0) {
        theField = theField.substring(1);
      }
      const colIndex = fields.findIndex((ele) => ele.name === theField);
      const displayAsLink = field.config.displayAsLink;
      const headerRow: any = {};
      headerRow.id = fields[index].id;
      headerRow.type = field.type;
      headerRow.displayAsLink = displayAsLink;
      headerRow.numeric = field.type === 'Decimal' || field.type === 'Integer' || field.type === 'Percentage' || field.type === 'Currency' || false;
      headerRow.disablePadding = false;
      headerRow.label = fields[index].label;
      if (colIndex > -1) {
        headerRow.classID = fields[colIndex].classID;
      }
      if (displayAsLink) {
        headerRow.isAssignmentLink = AssignDashObjects.includes(headerRow.classID);
        if (field.config.value?.startsWith('@CA')) {
          headerRow.isAssociation = true;
        }
      }
      return headerRow;
    });
  }

  function getUsingData(arTableData): any[] {
    if (selectionMode === SELECTION_MODE.SINGLE || selectionMode === SELECTION_MODE.MULTI) {
      const record = arTableData?.length > 0 ? arTableData[0] : '';
      if (typeof record === 'object' && !('pyGUID' in record) && !('pyID' in record)) {
        console.error('pyGUID or pyID values are mandatory to select the required row from the list');
      }
    }
    return arTableData?.map((data: any) => {
      return data;
    });
  }

  function getMyColumnList(arCols: any[]): string[] {
    const myColList: string[] = [];

    arCols.forEach((col) => {
      myColList.push(col.id);
    });

    return myColList;
  }

  /** Will return field from a filter expression */
  function getFieldFromFilter(filter, dateRange = false) {
    let fieldValue;
    if (dateRange) {
      fieldValue = filter?.AND[0]?.condition.lhs.field;
    } else {
      fieldValue = filter?.condition.lhs.field;
    }
    return fieldValue;
  }

  // Will be triggered when EVENT_DASHBOARD_FILTER_CHANGE fires
  function processFilterChange(data) {
    const { filterId, filterExpression } = data;
    let dashboardFilterPayload: any = {
      query: {
        filter: {},
        select: []
      }
    };

    filters.current[filterId] = filterExpression;
    let isDateRange = data.filterExpression?.AND;
    // Will be AND by default but making it dynamic in case we support dynamic relational ops in future
    const relationalOp = 'AND';

    let field = getFieldFromFilter(filterExpression, isDateRange);
    selectParam = [];
    // Constructing the select parameters list (will be sent in dashboardFilterPayload)
    columnList.current.forEach((col) => {
      selectParam.push({
        field: col
      });
    });

    // Checking if the triggered filter is applicable for this list
    if (data.filterExpression !== null && !(columnList.current?.length && columnList.current?.includes(field))) {
      return;
    }
    // This is a flag which will be used to reset dashboardFilterPayload in case we don't find any valid filters
    let validFilter = false;

    let index = 1;
    // Iterating over the current filters list to create filter data which will be POSTed
    for (const filterExp of Object.keys(filters.current)) {
      const filter = filters.current[filterExp];
      // If the filter is null then we can skip this iteration
      if (filter === null) {
        continue;
      }

      // Checking if the filter is of type- Date Range
      isDateRange = filter?.AND;
      field = getFieldFromFilter(filter, isDateRange);

      if (!(columnList.current.length && columnList.current.includes(field))) {
        continue;
      }
      // If we reach here that implies we've at least one valid filter, hence setting the flag
      validFilter = true;
      /** Below are the 2 cases for- Text & Date-Range filter types where we'll construct filter data which will be sent in the dashboardFilterPayload
       * In Constellation DX Components, through Repeating Structures they might be using several APIs to do it. We're doing it here
       */
      if (isDateRange) {
        const dateRelationalOp = filter?.AND ? 'AND' : 'OR';
        dashboardFilterPayload.query.filter.filterConditions = {
          ...dashboardFilterPayload.query.filter.filterConditions,
          [`T${index++}`]: { ...filter[relationalOp][0].condition },
          [`T${index++}`]: { ...filter[relationalOp][1].condition }
        };
        if (dashboardFilterPayload.query.filter.logic) {
          dashboardFilterPayload.query.filter.logic = `${dashboardFilterPayload.query.filter.logic} ${relationalOp} (T${
            index - 2
          } ${dateRelationalOp} T${index - 1})`;
        } else {
          dashboardFilterPayload.query.filter.logic = `(T${index - 2} ${relationalOp} T${index - 1})`;
        }

        dashboardFilterPayload.query.select = selectParam;
      } else {
        dashboardFilterPayload.query.filter.filterConditions = {
          ...dashboardFilterPayload.query.filter.filterConditions,
          [`T${index++}`]: { ...filter.condition, ignoreCase: true }
        };

        if (dashboardFilterPayload.query.filter.logic) {
          dashboardFilterPayload.query.filter.logic = `${dashboardFilterPayload.query.filter.logic} ${relationalOp} T${index - 1}`;
        } else {
          dashboardFilterPayload.query.filter.logic = `T${index - 1}`;
        }

        dashboardFilterPayload.query.select = selectParam;
      }
    }

    // Reset the dashboardFilterPayload if we end up with no valid filters for the list
    if (!validFilter) {
      dashboardFilterPayload = undefined;
    }
    filterPayload.current = dashboardFilterPayload;
    fetchDataFromServer();
  }

  // Will be triggered when EVENT_DASHBOARD_FILTER_CLEAR_ALL fires
  function processFilterClear() {
    filterPayload.current = undefined;
    fetchDataFromServer();
  }

  function fetchAllData(fields): any {
    let query: any = null;
    if (payload) {
      query = payload.query;
    } else if (fields?.length && meta.isQueryable) {
      if (filterPayload.current) {
        query = {
          select: fields,
          filter: filterPayload.current?.query?.filter
        };
      } else {
        query = { select: fields };
      }
    } else if (filterPayload.current) {
      query = filterPayload.current?.query;
    }
    const context = getPConnect().getContextName();
    // getDataAsync isn't returning correct data for the Page(i.e. ListView within a page) case
    return !bInForm
      ? // @ts-ignore - 3rd parameter "context" should be optional in getData method
        PCore.getDataApiUtils().getData(referenceList, payload)
      : // @ts-ignore - Argument of type 'null' is not assignable to parameter of type 'object'
        PCore.getDataPageUtils().getDataAsync(referenceList, context, payload ? payload.dataViewParameters : dataViewParameters, null, query);
  }

  const buildSelect = (fieldDefs, colId, patchQueryFields = [], compositeKeys = []) => {
    const listFields: any = [];
    if (colId) {
      const field = getField(fieldDefs, colId);
      listFields.push({
        field: field.name
      });
    } else {
      // NOTE: If we ever decide to not set up all the `fieldDefs` on select, ensure that the fields
      //  corresponding to `state.groups` are set up. Needed in Client-mode grouping/pagination.
      fieldDefs.forEach((field) => {
        if (!listFields.find((f) => f.field === field.name)) {
          listFields.push({
            field: field.name
          });
        }
      });
      patchQueryFields.forEach((k) => {
        if (!listFields.find((f) => f.field === k)) {
          listFields.push({
            field: k
          });
        }
      });
    }

    compositeKeys.forEach((k) => {
      if (!listFields.find((f) => f.field === k)) {
        listFields.push({
          field: k
        });
      }
    });
    return listFields;
  };

  const addItemKeyInSelect = (fieldDefs, itemKey, select, compositeKeys) => {
    const elementFound = getField(fieldDefs, itemKey);

    if (
      itemKey &&
      !elementFound &&
      Array.isArray(select) &&
      !(compositeKeys !== null && compositeKeys?.length) &&
      !select.find((sel) => sel.field === itemKey)
    ) {
      return [
        ...select,
        {
          field: itemKey
        }
      ];
    }

    return select;
  };

  const getField = (fieldDefs, columnId) => {
    const fieldsMap = getFieldsMap(fieldDefs);
    return fieldsMap.get(columnId);
  };

  const getFieldsMap = (fieldDefs) => {
    const fieldsMap = new Map();
    fieldDefs.forEach((element) => {
      fieldsMap.set(element.id, element);
    });
    return fieldsMap;
  };

  async function fetchDataFromServer() {
    let bCallSetRowsColumns = true;
    const { fieldDefs, itemKey, patchQueryFields } = meta;
    let listFields = fieldDefs ? buildSelect(fieldDefs, undefined, patchQueryFields, compositeKeys) : [];
    listFields = addItemKeyInSelect(fieldDefs, itemKey, listFields, compositeKeys);
    const workListJSON = await fetchAllData(listFields);

    // this is an unresovled version of this.fields$, need unresolved, so can get the property reference
    const columnFields = componentConfig.presets[0].children[0].children;

    const tableDataResults = !bInForm ? workListJSON.data.data : workListJSON.data;

    const myColumns = getHeaderCells(columnFields, fieldDefs);

    const selectParams: any = [];

    myColumns.forEach((column) => {
      selectParams.push({
        field: column.id
      });
    });

    const colList: any = [];

    selectParams.forEach((col) => {
      colList.push(col.field);
    });

    columnList.current = colList;

    setResponse(tableDataResults);

    const usingDataResults = getUsingData(tableDataResults);

    // store globally, so can be searched, filtered, etc.
    myRows = usingDataResults;
    myDisplayColumnList = getMyColumnList(myColumns);

    // At this point, if we have data ready to render and haven't been asked
    //  to NOT call setRows and setColumns, call them
    if (bCallSetRowsColumns) {
      setRows(myRows);
      setColumns(myColumns);
    }

    return () => {
      // Inspired by https://juliangaramendy.dev/blog/use-promise-subscription
      // The useEffect closure lets us have access to the bCallSetRowsColumns
      //  variable inside the useEffect and inside the "then" clause of the
      //  workListData promise
      //  So, if this cleanup code gets run before the promise .then is called,
      //  we can avoid calling the useState setters which would otherwise show a warning
      bCallSetRowsColumns = false;
    };
  }

  useEffect(() => {
    if (listContext.meta) {
      fetchDataFromServer();
      setTimeout(() => {
        PCore.getPubSubUtils().subscribe(
          PCore.getConstants().PUB_SUB_EVENTS.EVENT_DASHBOARD_FILTER_CHANGE,
          (data) => {
            processFilterChange(data);
          },
          `dashboard-component-${'id'}`,
          false,
          getPConnect().getContextName()
        );
        PCore.getPubSubUtils().subscribe(
          PCore.getConstants().PUB_SUB_EVENTS.EVENT_DASHBOARD_FILTER_CLEAR_ALL,
          () => {
            filters.current = {};
            processFilterClear();
          },
          `dashboard-component-${'id'}`,
          false,
          getPConnect().getContextName()
        );
      }, 0);

      return function cleanupSubscriptions() {
        PCore.getPubSubUtils().unsubscribe(
          PCore.getConstants().PUB_SUB_EVENTS.EVENT_DASHBOARD_FILTER_CHANGE,
          `dashboard-component-${'id'}`,
          getPConnect().getContextName()
        );
        PCore.getPubSubUtils().unsubscribe(
          PCore.getConstants().PUB_SUB_EVENTS.EVENT_DASHBOARD_FILTER_CLEAR_ALL,
          `dashboard-component-${'id'}`,
          getPConnect().getContextName()
        );
      };
    }
  }, [listContext]);

  function searchFilter(value: string, rows: any[]) {
    function filterArray(el: any): boolean {
      const bReturn = false;
      for (const key of Object.keys(el)) {
        // only search columsn that are displayed (pzInsKey and pxRefObjectClass are added and may or may not be displayed)
        if (myDisplayColumnList.includes(key)) {
          let myVal = el[key];
          if (myVal !== null) {
            if (typeof myVal !== 'string') {
              myVal = myVal.toString();
            }
            if (myVal.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
              return true;
            }
          }
        }
      }

      return bReturn;
    }

    rows = rows.filter(filterArray);

    return rows;
  }

  function _onSearch(event: any) {
    const searchValue = event.target.value;

    const filteredRows = searchFilter(searchValue, myRows.slice());

    setRows(filteredRows);
  }

  function showToast(message: string) {
    const theMessage = `Assignment: ${message}`;

    console.error(theMessage);
    setSnackbarMessage(message);
    setShowSnackbar(true);
  }

  function openAssignment(row) {
    const { pxRefObjectClass, pzInsKey } = row;
    const sTarget = thePConn.getContainerName();

    const options = { containerName: sTarget, channelName: '' };

    thePConn
      .getActionsApi()
      .openAssignment(pzInsKey, pxRefObjectClass, options)
      .then(() => {
        // console.log("openAssignment successful");
      })
      .catch(() => {
        showToast(`openAssignment failed!`);
      });
  }

  // function _rowClick(row: any) {
  //   // eslint-disable-next-line sonarjs/no-small-switch
  //   switch (rowClickAction) {
  //     case 'openAssignment':
  //       openAssignment(row);
  //       break;

  //     default:
  //       break;
  //   }
  // }

  function openWork(row) {
    const { pxRefObjectKey } = row;
    const pxRefObjectClass = row.pxRefObjectClass || row.pxObjClass;
    if (pxRefObjectClass !== '' && pxRefObjectKey !== '') {
      thePConn.getActionsApi().openWorkByHandle(pxRefObjectKey, pxRefObjectClass);
    }
  }

  function handleSnackbarClose() {
    setShowSnackbar(false);
  }

  function _menuClick(event: React.MouseEvent, columnId: string, columnType: string, label: string) {
    menuColumnId = columnId;
    menuColumnType = columnType;
    menuColumnLabel = label;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuAnchor({ top: rect.bottom, left: rect.left });
  }

  const [filterBy, setFilterBy] = useState<string>();
  const [containsDateOrTime, setContainsDateOrTime] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('string');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [displayDialogFilterName, setDisplayDialogFilterName] = useState<string>('');
  const [displayDialogContainsFilter, setDisplayDialogContainsFilter] = useState<string>('contains');
  const [displayDialogContainsValue, setDisplayDialogContainsValue] = useState<string>('');
  const [displayDialogDateFilter, setDisplayDialogDateFilter] = useState<string>('notequal');
  const [displayDialogDateValue, setDisplayDialogDateValue] = useState<string>('');

  function _filterMenu() {
    setMenuAnchor(null);

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

  function _groupMenu() {
    setMenuAnchor(null);
  }

  function _closeDialog() {
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

  function filterSortGroupBy() {
    // get original data set
    let theData = myRows.slice();

    // last filter config data is global
    theData = theData.filter(filterData(filterByColumns));

    // move data to array and then sort
    setRows(theData);
    createSortHandler(sortColumnId);
  }

  function _dialogContainsFilter(value: string) {
    setDisplayDialogContainsFilter(value);
  }

  function _dialogContainsValue(event) {
    setDisplayDialogContainsValue(event.target.value);
  }

  function _dialogDateFilter(value: string) {
    setDisplayDialogDateFilter(value);
  }

  function _dialogDateValue(event) {
    setDisplayDialogDateValue(event.target.value);
  }

  function _submitFilter() {
    updateFilterWithInfo();
    filterSortGroupBy();

    setOpen(false);
  }

  function _showButton(name, row) {
    let bReturn = false;
    const { pxRefObjectClass, pzInsKey, pxRefObjectKey } = row;
    switch (name) {
      case 'pxTaskLabel':
        if (pxRefObjectClass !== '' && pzInsKey !== '') {
          bReturn = true;
        }
        break;

      case 'pxRefObjectInsName':
        if (pxRefObjectClass !== '' && pxRefObjectKey !== '') {
          bReturn = true;
        }
        break;

      default:
        break;
    }

    return bReturn;
  }

  function _listViewClick(row, column) {
    const name = column.id;
    if (column.displayAsLink) {
      const { pxObjClass } = row;
      let { pzInsKey } = row;
      if (column.isAssociation) {
        const associationCategory = name.split(':')[0];
        pzInsKey = row[`${associationCategory}:pzInsKey`];
      }
      if (column.isAssignmentLink) {
        thePConn.getActionsApi().openAssignment(pzInsKey, pxObjClass, {
          containerName: 'primary',
          channelName: ''
        });
      } else {
        thePConn.getActionsApi().openWorkByHandle(pzInsKey, pxObjClass);
      }
    } else {
      switch (name) {
        case 'pxTaskLabel':
          openAssignment(row);
          break;

        case 'pxRefObjectInsName':
          openWork(row);
          break;

        default:
          break;
      }
    }
  }

  function _listTitle() {
    const defaultTitle = 'List';
    let title = resolvedConfigProps.title || resolvedConfigProps?.label || defaultTitle;
    const inheritedProps = resolvedConfigProps?.inheritedProps;

    // Let any title in resolvedConfigProps that isn't the default take precedence
    //  but only look in inheritedProps if they exist
    if (title === defaultTitle && inheritedProps) {
      for (const inheritedProp of inheritedProps) {
        if (inheritedProp?.prop === 'label') {
          title = inheritedProp?.value;
          break;
        }
      }
    }

    return title;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const reqObj = {};
    if (compositeKeys?.length > 1) {
      const index = response.findIndex((element) => element[rowID] === value);
      const selectedRow = response[index];
      compositeKeys.forEach((element) => {
        reqObj[element] = selectedRow[element];
      });
    } else {
      reqObj[rowID] = value;
    }
    getPConnect()?.getListActions?.()?.setSelectedRows([reqObj]);
    setSelectedValue(value);
  };

  const onCheckboxClick = (rowValue: string, checked: boolean) => {
    const reqObj: any = {};
    if (compositeKeys?.length > 1) {
      const index = response.findIndex((element) => element[rowID] === rowValue);
      const selectedRow = response[index];
      compositeKeys.forEach((element) => {
        reqObj[element] = selectedRow[element];
      });
      reqObj.$selected = checked;
    } else {
      reqObj[rowID] = rowValue;
      reqObj.$selected = checked;
    }
    getPConnect()?.getListActions()?.setSelectedRows([reqObj]);
  };

  const processColumnValue = (column, value) => {
    let val;
    const type = column.type;
    let theDateFormatInfo;
    let theFormat;
    let theCurrencyOptions;
    switch (type) {
      case 'Date':
      case 'DateTime':
        theDateFormatInfo = getDateFormatInfo();
        theFormat = type === 'DateTime' ? `${theDateFormatInfo.dateFormatStringLong} hh:mm a` : theDateFormatInfo.dateFormatStringLong;
        val = format(value, column.type, { format: theFormat });
        break;

      case 'Currency':
        theCurrencyOptions = getCurrencyOptions(PCore?.getEnvironmentInfo()?.getLocale() as string);
        val = format(value, column.type, theCurrencyOptions);
        break;

      default:
        val = column.format && typeof value === 'number' ? column.format(value) : value;
    }
    return val;
  };

  // Pagination helper values
  const totalRows = arRows ? arRows.length : 0;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startRow = totalRows > 0 ? page * rowsPerPage + 1 : 0;
  const endRow = Math.min((page + 1) * rowsPerPage, totalRows);

  return (
    <>
      {arColumns && arColumns.length > 0 && (
        <div className='mt-4 mb-4 grid w-full rounded-md border bg-background shadow-sm'>
          <h6 className='mt-2 ml-2 text-lg font-medium text-foreground'>{_listTitle()}</h6>
          {globalSearch && (
            <div className='flex items-end gap-2 p-1'>
              <Search className='h-5 w-5 text-muted-foreground' />
              <input
                type='text'
                placeholder={PCore.getLocaleUtils().getLocaleValue('Search', 'Search')}
                id='search'
                onChange={_onSearch}
                className='flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              />
            </div>
          )}
          <>
            {!bInForm ? (
              <div id='list-view' className='min-w-[750px] max-h-[550px] overflow-auto'>
                <table className='w-full border-collapse'>
                  <thead className='sticky top-0 bg-muted'>
                    <tr>
                      {arColumns.map((column) => {
                        return (
                          <th key={column.id} className='whitespace-nowrap border-b px-4 py-3 text-left text-sm font-medium text-muted-foreground'>
                            <span
                              className='inline-flex cursor-pointer items-center gap-1 select-none'
                              onClick={createSortHandler(column.id)}
                              role='button'
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') createSortHandler(column.id)(e as any);
                              }}
                            >
                              {column.label}
                              {orderBy === column.id ? (
                                order === 'desc' ? (
                                  <ChevronDown className='h-4 w-4' />
                                ) : (
                                  <ChevronUp className='h-4 w-4' />
                                )
                              ) : (
                                <span className='inline-block h-4 w-4' />
                              )}
                              {_showFilteredIcon(column.id) && <Filter className='h-4 w-4 text-primary' />}
                              <span className='sr-only'>
                                {orderBy === column.id ? (order === 'desc' ? 'sorted descending' : 'sorted ascending') : ''}
                              </span>
                            </span>
                            <button
                              type='button'
                              className='ml-1 inline-flex items-center align-bottom text-muted-foreground hover:text-foreground'
                              onClick={(event) => {
                                _menuClick(event, column.id, column.type, column.label);
                              }}
                            >
                              <MoreVertical className='h-4 w-4' />
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {stableSort(arRows, getComparator(order, orderBy))
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => {
                        return (
                          <tr key={row.pxRefObjectInsName || row.pyID} className='border-b hover:bg-muted/50'>
                            {arColumns.map((column) => {
                              const value = row[column.id];
                              return (
                                <td key={column.id} className='whitespace-nowrap px-4 py-2 text-sm'>
                                  {_showButton(column.id, row) || column.displayAsLink ? (
                                    <button
                                      type='button'
                                      className='text-primary underline-offset-4 hover:underline'
                                      onClick={() => {
                                        _listViewClick(row, column);
                                      }}
                                    >
                                      {column.format && typeof value === 'number' ? column.format(value) : value}
                                    </button>
                                  ) : (
                                    <>{column.format && typeof value === 'number' ? column.format(value) : value}</>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div id='list-view'>
                <table className='w-full min-w-[750px] border-collapse'>
                  <thead className='bg-muted'>
                    <tr>
                      {(selectionMode === SELECTION_MODE.SINGLE || selectionMode === SELECTION_MODE.MULTI) && (
                        <th className='w-12 border-b px-4 py-3' />
                      )}
                      {arColumns.map((column) => {
                        return (
                          <th key={column.id} className='whitespace-nowrap border-b px-4 py-3 text-left text-sm font-medium text-muted-foreground'>
                            <span
                              className='inline-flex cursor-pointer items-center gap-1 select-none'
                              onClick={createSortHandler(column.id)}
                              role='button'
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') createSortHandler(column.id)(e as any);
                              }}
                            >
                              {column.label}
                              {orderBy === column.id ? (
                                order === 'desc' ? (
                                  <ChevronDown className='h-4 w-4' />
                                ) : (
                                  <ChevronUp className='h-4 w-4' />
                                )
                              ) : (
                                <span className='inline-block h-4 w-4' />
                              )}
                              <span className='sr-only'>
                                {orderBy === column.id ? (order === 'desc' ? 'sorted descending' : 'sorted ascending') : ''}
                              </span>
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {arRows &&
                      arRows.length > 0 &&
                      stableSort(arRows, getComparator(order, orderBy))
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => {
                          return (
                            <tr key={row[rowID]} className='border-b hover:bg-muted/50'>
                              {selectionMode === SELECTION_MODE.SINGLE && (
                                <td className='px-4 py-2'>
                                  <input
                                    type='radio'
                                    onChange={handleChange}
                                    value={row[rowID]}
                                    name='radio-buttons'
                                    aria-label='A'
                                    checked={selectedValue === row[rowID]}
                                    className='h-4 w-4 border-gray-300 text-primary focus:ring-primary'
                                  />
                                </td>
                              )}
                              {selectionMode === SELECTION_MODE.MULTI && (
                                <td className='px-4 py-2'>
                                  <Checkbox
                                    onCheckedChange={(checked: boolean | 'indeterminate') => onCheckboxClick(String(row[rowID]), checked === true)}
                                    checked={selectedValues.some((sv) => sv[rowID] === row[rowID])}
                                    value={row[rowID]}
                                  />
                                </td>
                              )}
                              {arColumns.map((column) => {
                                const value = row[column.id];
                                return (
                                  <td key={column.id} className='whitespace-nowrap px-4 py-2 text-sm'>
                                    {processColumnValue(column, value)}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
                {arRows && arRows.length === 0 && <div className='no-records'>No records found.</div>}
              </div>
            )}
          </>
          {arRows && arRows.length > 0 && (
            <div id='pagination' className='flex items-center justify-end gap-4 border-t px-4 py-2 text-sm text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleChangeRowsPerPage(e.target.value)}
                  className='rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <span>
                {startRow}-{endRow} of {totalRows}
              </span>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  disabled={page === 0}
                  onClick={() => handleChangePage(page - 1)}
                  className='inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-50'
                  aria-label='Previous page'
                >
                  <ChevronUp className='h-4 w-4 -rotate-90' />
                </button>
                <button
                  type='button'
                  disabled={page >= totalPages - 1}
                  onClick={() => handleChangePage(page + 1)}
                  className='inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-50'
                  aria-label='Next page'
                >
                  <ChevronDown className='h-4 w-4 -rotate-90' />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Column context menu */}
      {menuAnchor && (
        <div
          ref={menuRef}
          className='fixed z-50 min-w-[160px] rounded-md border bg-popover py-1 text-popover-foreground shadow-md'
          style={{ top: menuAnchor.top, left: menuAnchor.left }}
        >
          <button
            type='button'
            className='flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
            onClick={_filterMenu}
          >
            <Filter className='h-4 w-4' /> Filter
          </button>
          <button
            type='button'
            className='flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
            onClick={_groupMenu}
          >
            <FileText className='h-4 w-4' /> Group
          </button>
        </div>
      )}

      {/* Filter dialog */}
      {open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50' onClick={_closeDialog}>
          <div className='w-full max-w-md rounded-lg border bg-background p-0 shadow-lg' onClick={(e) => e.stopPropagation()}>
            <div className='border-b px-6 py-4'>
              <h3 className='text-lg font-semibold text-foreground'>Filter: {filterBy}</h3>
            </div>
            <div className='px-6 py-4'>
              {containsDateOrTime ? (
                <>
                  <Select value={displayDialogDateFilter} onValueChange={_dialogDateFilter}>
                    <SelectTrigger label='' className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='notequal'>is not equal to</SelectItem>
                      <SelectItem value='after'>after</SelectItem>
                      <SelectItem value='before'>before</SelectItem>
                      <SelectItem value='null'>is null</SelectItem>
                      <SelectItem value='notnull'>is not null</SelectItem>
                    </SelectContent>
                  </Select>
                  {filterType === 'Date' && (
                    <input
                      autoFocus
                      id='containsFilter'
                      type='date'
                      className='mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                      value={displayDialogDateValue}
                      onChange={_dialogDateValue}
                    />
                  )}
                  {filterType === 'DateTime' && (
                    <input
                      autoFocus
                      id='containsFilter'
                      type='datetime-local'
                      className='mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                      value={displayDialogDateValue}
                      onChange={_dialogDateValue}
                    />
                  )}
                  {filterType === 'Time' && (
                    <input
                      autoFocus
                      id='containsFilter'
                      type='time'
                      className='mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                      value={displayDialogDateValue}
                      onChange={_dialogDateValue}
                    />
                  )}
                </>
              ) : (
                <>
                  <Select value={displayDialogContainsFilter} onValueChange={_dialogContainsFilter}>
                    <SelectTrigger label='' className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='contains'>Contains</SelectItem>
                      <SelectItem value='equals'>Equals</SelectItem>
                      <SelectItem value='startswith'>Starts with</SelectItem>
                    </SelectContent>
                  </Select>
                  <input
                    autoFocus
                    id='containsFilter'
                    type='text'
                    className='mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    value={displayDialogContainsValue}
                    onChange={_dialogContainsValue}
                  />
                </>
              )}
            </div>
            <div className='flex justify-end gap-2 border-t px-6 py-4'>
              <Button variant='secondary' onClick={_closeDialog}>
                Cancel
              </Button>
              <Button onClick={_submitFilter}>Submit</Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification (replaces MUI Snackbar) */}
      {showSnackbar && (
        <div
          className='fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md bg-gray-800 px-4 py-3 text-sm text-white shadow-lg transition-opacity duration-300'
          role='alert'
        >
          <span>{snackbarMessage}</span>
          <button
            type='button'
            aria-label='close'
            className='ml-2 inline-flex items-center rounded p-1 hover:bg-gray-700'
            onClick={handleSnackbarClose}
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      )}
    </>
  );
}
