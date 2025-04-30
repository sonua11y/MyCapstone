import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/TenKTable.css';
import AutoCompleteSearch from './AutoCompleteSearch';

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
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students data
        const studentsResponse = await fetch('http://localhost:5000/students/tenk-fees');
        if (!studentsResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        const studentsData = await studentsResponse.json();
        if (!Array.isArray(studentsData)) {
          throw new Error('Invalid data format received');
        }
        setStudents(studentsData);

        // Fetch last update time
        const updateResponse = await fetch('http://localhost:5000/students/last-updated');
        if (!updateResponse.ok) {
          throw new Error('Failed to fetch last update time');
        }
        const updateData = await updateResponse.json();
        setLastUpdate(updateData.lastModified);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    
    let filtered = [...students];

    if (selectedCollege) {
      filtered = filtered.filter(student =>
        student?.college?.toLowerCase() === selectedCollege.toLowerCase()
      );
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student => {
        const firstName = student?.firstName || '';
        const lastName = student?.lastName || '';
        const transactionId = student?.transactionId || '';
        const college = student?.college || '';
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
        <h2 className="tenk-table-title">Student Records - 10K Paid</h2>
        <p className="tenk-table-date">Last updated: {lastUpdate}</p>

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
                  <td>{student?.uploadDate || 'N/A'}</td>
                  <td>{student?.dateOfPayment || 'N/A'}</td>
                  <td>{student?.transactionId || 'N/A'}</td>
                  <td className="font-semibold">{student?.firstName || 'N/A'}</td>
                  <td className="font-semibold">{student?.lastName || 'N/A'}</td>
                  <td>{student?.college?.trim() || 'N/A'}</td>
                  <td>
                    <span className={`tenk-badge ${(student?.feePaid || '').toLowerCase() === 'yes' ? 'yes' : 'no'}`}>
                      {student?.feePaid || 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`sem-badge ${(student?.semFee || '').toLowerCase() === 'yes' ? 'yes' : 'no'}`}>
                      {student?.semFee || 'No'}
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
