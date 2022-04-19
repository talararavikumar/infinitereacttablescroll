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

      if (!(!hasNextPage || index < rows.length)) {
        const content = "Loading...";
        return <div style={style}>{content}</div>;
      } else {
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
        }
    },
    [prepareRow, rows, hasNextPage]
  )

  const itemCount = hasNextPage ? rows.length + 1 : rows.length;

  // Every row is loaded except for our loading indicator row.

  // Render an item or a loading indicator.
  const Item = ({ index, style }) => {
    let content;
    if (!isItemLoaded(index)) {
      content = "Loading...";
      return <div style={style}>{content}</div>;
    } else {
      content = `${index}`;
      return <div style={style}>{content}</div>;
    }

    
  };

  const isItemLoaded = index => !hasNextPage || index < rows.length;
  console.log(isItemLoaded());
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
              itemCount={itemCount}
              itemSize={35}
              width={totalColumnsWidth + scrollBarSize}
              className="list-container"
              onItemsRendered={onItemsRendered}
              ref={ref}
              overscanCount={4}
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
  const [hasNextPage, setHasNextPage] = useState(true);
  const [moreItemsLoading, setMoreItemsLoading] = useState(false);
  const [data, setData] = useState(makeData(50));

  const loadMore =  () => {
    setMoreItemsLoading(true);
    setTimeout(() => {
      if(data.length < 100){
        setData([...data, ...makeData(50)]);
      }
      else{
        setHasNextPage(false);
        setData([...data, ...makeData(10)]);
      }

    }, 5000);
    

    
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
