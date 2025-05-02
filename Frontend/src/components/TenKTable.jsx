import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/TenKTable.css';
import AutoCompleteSearch from './AutoCompleteSearch';
import api from '../utils/api';
import config from '../config/config';

const formatDate = (dateString) => {
  if (!dateString || dateString === '-') return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return '-';
  }
};

const TenKTable = ({ selectedMonth, selectedCollege }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFields] = useState(['firstName', 'lastName', 'transactionId', 'college']);
  const [lastUpdate, setLastUpdate] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both data in parallel
        const [studentsResponse, updateResponse] = await Promise.all([
          api.get('/students/tenk-fees'),
          api.get('/students/last-updated')
        ]);
        
        if (!studentsResponse.data) {
          throw new Error('Failed to fetch data');
        }
        const studentsData = studentsResponse.data;
        if (!Array.isArray(studentsData)) {
          throw new Error('Invalid data format received');
        }
        setStudents(studentsData);

        if (updateResponse.data && updateResponse.data.lastModified) {
        setLastUpdate(updateResponse.data.lastModified);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchLastUpdateTime = async () => {
      try {
        const response = await api.get('/students/last-updated');
        if (response.data && response.data.lastModified) {
          setLastUpdateTime(response.data.lastModified);
        }
      } catch (error) {
        console.error('Error fetching last update time:', error);
      }
    };

    fetchLastUpdateTime();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    
    let filtered = [...students];

    if (selectedCollege) {
      filtered = filtered.filter(student =>
        student?.['College']?.toLowerCase() === selectedCollege.toLowerCase()
      );
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student => {
        const firstName = student?.['First Name'] || '';
        const lastName = student?.['Last Name'] || '';
        const transactionId = student?.['Transaction id'] || '';
        const college = student?.['College'] || '';
        return firstName.toLowerCase().includes(searchLower) ||
               lastName.toLowerCase().includes(searchLower) ||
               transactionId.toString().includes(searchLower) ||
               college.toLowerCase().includes(searchLower);
      });
    }

    return filtered;
  }, [students, searchTerm, selectedCollege]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCollege, searchTerm]);

  if (loading) {
    return (
      <div className="tenk-table-wrapper">
        <div className="animate-pulse text-center p-4">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tenk-table-wrapper">
        <div className="text-red-500 text-center p-4">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="tenk-table-wrapper">
      <div className="tenk-table-header">
        <div className="tenk-table-title-section">
          <h2 className="tenk-table-title">
            Student Records - 10K Paid
            {selectedCollege && <span> - {selectedCollege}</span>}
          </h2>
          {lastUpdate && (
            <p className="tenk-table-date">
              Last updated: {lastUpdate}
            </p>
          )}
        </div>
        <div className="tenk-table-search">
          <AutoCompleteSearch
            onSearch={handleSearch}
            onSuggestionSelect={handleSuggestionSelect}
            searchFields={searchFields}
            placeholder="Search by name, transaction ID, or college..."
          />
        </div>
      </div>

      <div className="tenk-table-container">
        <table className="tenk-table">
          <thead>
            <tr>
              <th>Upload Date</th>
              <th>Date of Payment</th>
              <th>Transaction ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>College</th>
              <th>10K</th>
              <th>Sem Fee</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.length > 0 ? (
              currentStudents.map((student) => (
                <tr key={student._id}>
                  <td>{student?.['Upload date'] || 'N/A'}</td>
                  <td>{student?.['Date of payment'] || 'N/A'}</td>
                  <td>{student?.['Transaction id'] || 'N/A'}</td>
                  <td className="font-semibold">{student?.['First Name'] || 'N/A'}</td>
                  <td className="font-semibold">{student?.['Last Name'] || 'N/A'}</td>
                  <td>{student?.['College']?.trim() || 'N/A'}</td>
                  <td>
                    <span className={`tenk-badge ${(student?.['10K'] || '').toLowerCase() === 'yes' ? 'yes' : 'no'}`}>
                      {student?.['10K'] || 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`sem-badge ${(student?.['Sem Fee'] || '').toLowerCase() === 'yes' ? 'yes' : 'no'}`}>
                      {student?.['Sem Fee'] || 'No'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center' }}>
                  No students found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="tenk-table-footer">
        <div>
          Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} entries
        </div>
        <div className="tenk-table-pagination">
          <button
            className="tenk-pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`tenk-pagination-button page-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="tenk-pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenKTable;
