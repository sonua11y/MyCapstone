import React from 'react';
import './TenKTable.css';
import '../../styles/status-badges.css';

const TenKTable = ({ data }) => {
  return (
    <div className="tenk-table-container">
      <table className="tenk-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>10K</th>
            <th>Sem Fee</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.companyName}</td>
              <td>
                <span className="tenk-badge">
                  {item.tenkFee}
                </span>
              </td>
              <td>
                <span className={`sem-badge ${item.semFee.toLowerCase()}`}>
                  {item.semFee}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TenKTable; 