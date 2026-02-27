import { Utils } from '@pega/react-sdk-components/lib/components/helpers/utils';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import isDeepEqual from 'fast-deep-equal/react';
import { useEffect, useRef, useState } from 'react';

interface CaseHistoryProps extends PConnProps {
  // If any, enter additional props that only exist on this component
}

export default function CaseHistory(props: CaseHistoryProps) {
  const { getPConnect } = props;
  const thePConn = getPConnect();
  // let waitingForData = true;

  const displayedColumns = [
    {
      label: thePConn.getLocalizedValue('Date', '', ''),
      type: 'DateTime',
      fieldName: 'pxTimeCreated'
    }, // 2nd and 3rd args empty string until typedef marked correctly
    {
      label: thePConn.getLocalizedValue('Description', '', ''),
      type: 'TextInput',
      fieldName: 'pyMessageKey'
    }, // 2nd and 3rd args empty string until typedef marked correctly
    {
      label: thePConn.getLocalizedValue('Performed by', '', ''),
      type: 'TextInput',
      fieldName: 'pyPerformer'
    } // 2nd and 3rd args empty string until typedef marked correctly
  ];

  const rowData: any = useRef([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [waitingForData, setWaitingForData] = useState<boolean>(true);

  const caseID = thePConn.getValue(PCore.getConstants().CASE_INFO.CASE_INFO_ID, ''); // 2nd arg empty string until typedef marked correctly
  const dataViewName = 'D_pyWorkHistory';
  const context = thePConn.getContextName();

  function computeRowData(rows: object[]): void {
    const theRowData: object[] = [];

    rows.forEach((row: any, rowIndex: number) => {
      // Now, for each property in the index of row properties (displayedColumns), add an object
      //  to a new array of values
      const rowDisplayValues: any = [];

      displayedColumns.forEach((column: any, rowValIndex) => {
        const theType = column.type;
        const theFieldName = column.fieldName;
        const theValue =
          theType === 'Date' || theType === 'DateTime' ? Utils.generateDateTime(row[theFieldName], 'DateTime-Short') : row[theFieldName];
        rowDisplayValues[rowValIndex] = theValue;
      });

      theRowData[rowIndex] = rowDisplayValues;
    });

    if (!isDeepEqual(theRowData, rowData.current)) {
      // Only update rowData.current when it actually changes (to prevent infinite loop)
      rowData.current = theRowData;
    }
  }

  // Get the case history data when component mounted/initialized
  useEffect(() => {
    let bCallSetWaitingForData = true;

    const historyData = PCore.getDataApiUtils().getData(
      dataViewName,
      { dataViewParameters: [{ CaseInstanceKey: caseID }] } as any,
      context
    ) as Promise<any>;

    historyData.then((historyJSON: any) => {
      const tableDataResults = historyJSON.data.data;

      // compute the rowData using the tableDataResults
      computeRowData(tableDataResults);

      // At this point, if we have data ready to render and haven't been asked
      //  to NOT call setWaitingForData, we can stop progress indicator
      if (bCallSetWaitingForData) {
        setWaitingForData(false);
      }
    });

    return () => {
      // Inspired by https://juliangaramendy.dev/blog/use-promise-subscription
      // The useEffect closure lets us have access to the bCallSetWaitingForData
      //  variable inside the useEffect and inside the "then" clause of the
      //  historyData promise
      //  So, if this cleanup code gets run before the promise .then is called,
      //  we can avoid calling the useState setter which would otherwise show a warning
      bCallSetWaitingForData = false;
    };
  }, []);

  function getTableHeader() {
    const theRowKey = 'CaseHistory.TableHeader';

    const theHeaderCells: any[] = displayedColumns.map((headerCol, index) => {
      const theCellKey = `${theRowKey}.${index}`;
      return (
        <th key={theCellKey} className='border border-[silver] bg-muted px-4 py-2 text-left text-muted-foreground'>
          {headerCol.label}
        </th>
      );
    });

    return <tr key={theRowKey}>{theHeaderCells}</tr>;
  }

  function getTableData() {
    const theDataRows: any[] = [];

    // Note: using rowData.current since we're using useRef as a mutatable
    //  value that's only updated when it changes.
    if (rowData.current.length > 0) {
      rowData.current.forEach((dataRow: object[], index) => {
        // using dataRow[0]-dataRow[1] as the array key since it's a unique value
        const theKey = `CaseHistory-${index}`;
        theDataRows.push(
          <tr key={theKey}>
            <td className='border border-[silver] px-4 py-2'>{dataRow[0] ? String(dataRow[0]) : '---'}</td>
            <td className='border border-[silver] px-4 py-2'>{dataRow[1] ? String(dataRow[1]) : '---'}</td>
            <td className='border border-[silver] px-4 py-2'>{dataRow[2] ? String(dataRow[2]) : '---'}</td>
          </tr>
        );
      });
    }

    return theDataRows;
  }

  return (
    <div id='CaseHistory' className='w-full overflow-auto'>
      <table className='w-full border-collapse'>
        <thead>{getTableHeader()}</thead>
        <tbody>{getTableData()}</tbody>
      </table>
    </div>
  );
}
