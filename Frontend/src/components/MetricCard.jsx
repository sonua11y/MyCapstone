import React from 'react';
// import '../styles/MetricCard.css';
import "../styles/app.css"

const MetricCard = ({ 
  title, 
  value, 
  bgColor,
  icon
}) => {
  return (
    <div className="metric-card">
      <div className={`metric-icon-container ${bgColor}`}>
        {icon}
      </div>
      <div className="metric-content">
        <div className="metric-header">
          <span className="metric-title">{title}</span>
        </div>
        <div className="metric-value-container">
          <span className="metric-value">{value}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard; 