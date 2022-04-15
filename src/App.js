import React , {useState} from 'react'
import styled from 'styled-components'
import { useTable, useBlockLayout } from 'react-table'
import { FixedSizeList } from 'react-window'
import scrollbarWidth from './scrollbarWidth'
import InfiniteLoader from "react-window-infinite-loader";


import makeData from './makeData'

const Styles = styled.div`
  padding: 1rem;

  .table {
    display: inline-block;
    border-spacing: 0;
    border: 1px solid black;

    .tr {
      :last-child {
        .td {
          border-bottom: 0;
        }
      }
    }

    .th,
    .td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 1px solid black;
      }
    }
  }
`

function Table({ columns, data, moreItemsLoading, hasNextPage,  loadMore}) {
  // Use the state and functions returned from useTable to build your UI

  const defaultColumn = React.useMemo(
    () => ({
      width: 150,
    }),
    []
  )

  const scrollBarSize = React.useMemo(() => scrollbarWidth(), [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useBlockLayout
  )

  const RenderRow = React.useCallback(
    ({ index, style }) => {
      const row = rows[index]
      prepareRow(row)
      return (
        <div
          {...row.getRowProps({
            style,
          })}
          className="tr"
        >
          {row.cells.map(cell => {
            return (
              <div {...cell.getCellProps()} className="td">
                {cell.render('Cell')}
              </div>
            )
          })}
        </div>
      )
    },
    [prepareRow, rows]
  )

  const itemCount = hasNextPage ? rows.length + 1 : rows.length;
  // Render the UI for your table
  return (
    <div {...getTableProps()} className="table">
      <div>
        {headerGroups.map(headerGroup => (
          <div {...headerGroup.getHeaderGroupProps()} className="tr">
            {headerGroup.headers.map(column => (
              <div {...column.getHeaderProps()} className="th">
                {column.render('Header')}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div {...getTableBodyProps()}>
        <InfiniteLoader
          isItemLoaded={index => index < rows.length}
          itemCount={itemCount}
          loadMoreItems={loadMore}
        >
          {({ onItemsRendered, ref }) => (
            <FixedSizeList
              height={400}
              itemCount={rows.length}
              itemSize={35}
              width={totalColumnsWidth + scrollBarSize}
              className="list-container"
              onItemsRendered={onItemsRendered}
              ref={ref}
            >
              {RenderRow}
            </FixedSizeList>
          )}
        </InfiniteLoader>
      </div>
    </div>
  )
}

function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Row Index',
        accessor: (row, i) => i,
      },
      {
        Header: 'Name',
        columns: [
          {
            Header: 'First Name',
            accessor: 'firstName',
          },
          {
            Header: 'Last Name',
            accessor: 'lastName',
          },
        ],
      },
      {
        Header: 'Info',
        columns: [
          {
            Header: 'Age',
            accessor: 'age',
            width: 50,
          },
          {
            Header: 'Visits',
            accessor: 'visits',
            width: 60,
          },
          {
            Header: 'Status',
            accessor: 'status',
          },
          {
            Header: 'Profile Progress',
            accessor: 'progress',
          },
        ],
      },
    ],
    []
  )

  // const data = React.useMemo(() => makeData(50), []);
  const [hasNextPage] = useState(true);
  const [moreItemsLoading, setMoreItemsLoading] = useState(false);
  const [data, setData] = useState(makeData(50));

  const loadMore =  () => {
    setMoreItemsLoading(true);
    setData([...data, ...makeData(50)]);

    
    // fetch('https://dog.ceo/api/breeds/image/random/10')
    //   .then(res => res.json())
    //   .then(({ message: newItems }) => this.setState({ 
    //     moreItemsLoading: false,
    //     items: [...this.state.items, ...newItems] 
    //   }));
    };

  return (
    <Styles>
      <Table columns={columns} data={data} hasNextPage = {hasNextPage} 
      moreItemsLoading = {moreItemsLoading} loadMore = {loadMore}/>
    </Styles>
  )
}

export default App
