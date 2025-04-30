import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X } from 'lucide-react';
import SemFeeTable from './SemFeeTable';
import '../styles/FeeCollectionStatus.css';

const FeeCollectionStatus = ({ onMonthSelect, selectedMonth }) => {
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    fetchFeeCollectionData();
    fetchTotalStudents();
    const fetchLastUpdate = async () => {
      try {
        const response = await fetch('http://localhost:5000/students/last-updated');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setLastUpdate(data.lastModified);
      } catch (error) {
        console.error('Error fetching last update time:', error);
      }
    };

    fetchLastUpdate();
  }, []);

  useEffect(() => {
    setPieData([
      { name: 'Collected Fees', value: totalCollected, color: '#1de9b6' },
      { name: 'Pending Fees', value: totalPending - totalCollected, color: '#ff5252' },
    ]);
  }, [totalCollected, totalPending]);

  const fetchTotalStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/students/count');
      const data = await response.json();
      setTotalStudents(data.count);
      const totalExpectedFees = data.count * 350000;
      setTotalPending(totalExpectedFees);
    } catch (error) {
      console.error("Error fetching total students:", error);
    }
  };

  const fetchFeeCollectionData = async () => {
    try {
      const response = await fetch('http://localhost:5000/students/sem-fee-paid');
      const data = await response.json();
      const totalFees = data.reduce((sum, item) => sum + (item.fees * 350000), 0);
      setTotalCollected(totalFees);
      const formattedData = data.map(item => ({
        college: item.college,
        fees: item.fees
      }));
      setBarData(formattedData);
    } catch (error) {
      console.error("Error fetching fee collection data:", error);
    }
  };

  const handleBarClick = (data) => {
    if (selectedCollege === data.college) {
      setSelectedCollege(null);
    } else {
      setSelectedCollege(data.college);
    }
  };

  const clearFilter = () => {
    setSelectedCollege(null);
  };

  return (
    <div className="fee-collection-container">
      <div className="charts-container">
        <div className="fee-chart-section">
          <div className="fee-chart-header">
            <h3 className="fee-title">University Fee Status</h3>
            <p className="fee-subtitle">
              Last updated: {lastUpdate}
              {selectedCollege && (
                <span className="filter-badge">
                  Filtering by: <strong>{selectedCollege}</strong>
                  <button 
                    onClick={clearFilter} 
                    className="clear-filter-btn"
                    style={{ 
                      background: 'none', 
                      border: 'none',
                      cursor: 'pointer',
                      marginLeft: '5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px'
                    }}
                  >
                    <X size={16} />
                  </button>
                </span>
              )}
            </p>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData} margin={{ top: 20, right: 10, left: 50, bottom: 5 }}>
                <XAxis 
                  dataKey="college" 
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  onClick={(e) => {
                    const college = e.value;
                    handleBarClick({ college });
                  }}
                  style={{ cursor: 'pointer' }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis width={50} />
                <Tooltip />
                <Bar 
                  dataKey="fees" 
                  fill="#8884d8" 
                  fillOpacity={0.8} 
                  onClick={(data) => handleBarClick(data)} 
                  cursor="pointer"
                >
                  {barData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.college === selectedCollege ? '#5151C6' : '#8884d8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="fee-chart-section">
          <div className="fee-chart-header">
            <h3 className="fee-title">Fee Summary</h3>
            <p className="fee-subtitle">Last updated: {lastUpdate}</p>
          </div>
          <div className="fee-chart-content">
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={130}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `₹${value.toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <SemFeeTable selectedCollege={selectedCollege} />
    </div>
  );
};

export default FeeCollectionStatus;
