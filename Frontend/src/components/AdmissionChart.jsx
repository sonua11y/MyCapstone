import React, { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { X } from 'lucide-react';
import '../styles/AdmissionChart.css';
import api from '../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdmissionChart = ({ onCollegeSelect, selectedCollege }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch admissions data
        const admissionsResponse = await api.get('/students/admissions');
        if (!admissionsResponse.data) {
          throw new Error('Failed to fetch data');
        }
        setData(admissionsResponse.data);

        // Fetch last update time
        const updateResponse = await api.get('/students/last-updated');
        if (!updateResponse.data) {
          throw new Error('Failed to fetch last update time');
        }
        setLastUpdate(updateResponse.data.lastModified);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;

    // Data is already in the correct format from the backend
    const sortedColleges = data
      .filter(item => item.College && item.College !== "Unknown")
      .sort((a, b) => b.count - a.count);

    return {
      labels: sortedColleges.map(item => item.College),
      datasets: [
        {
          label: 'Number of Students',
          data: sortedColleges.map(item => item.count),
          backgroundColor: sortedColleges.map(item => 
            item.College === selectedCollege 
              ? 'rgba(75, 192, 192, 0.8)'  
              : 'rgba(75, 192, 192, 0.4)'
          ),
          borderColor: 'rgb(57, 169, 169)',
          borderWidth: 1,
          barThickness: 40,
          maxBarThickness: 50,
        },
      ],
    };
  }, [data, selectedCollege]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 30,
        top: 20,
        bottom: 20
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Students: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false
        },
        ticks: {
          stepSize: 20,
          padding: 10,
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const college = chartData.labels[index];
        onCollegeSelect(college === selectedCollege ? null : college);
      }
    },
    interaction: {
      intersect: true,
      mode: 'nearest'
    }
  };

  if (!chartData) return <div>No data available</div>;

  return (
    <div className="admission-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">College-wise Status</h3>
        <p className="chart-subtitle">
          Last updated: {lastUpdate}
          {selectedCollege && (
            <span className="filter-badge" style={{ color: 'rgba(75, 192, 192, 0.9)' }}>
              Filtering by: <strong>{selectedCollege}</strong>
              <button 
                onClick={() => onCollegeSelect(null)} 
                className="clear-filter-btn"
                style={{ 
                  background: 'none', 
                  border: 'none',
                  cursor: 'pointer',
                  marginLeft: '5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px',
                  color: 'rgba(75, 192, 192, 0.9)'
                }}
              >
                <X size={16} />
              </button>
            </span>
          )}
        </p>
      </div>
      <div className="chart-content">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default AdmissionChart;
