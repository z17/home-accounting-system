import React from 'react';

const BalanceSourceLines = ({sources}) => {
  return <tr>
    {sources.map((source) =>
    <td key={source.id}>
      <th>{source.name}</th>
      <td>2324</td>
      <td>2324</td>
      <td>2324</td>
      <td>2324</td>
    </td>
  )}</tr>
}


export default BalanceSourceLines;