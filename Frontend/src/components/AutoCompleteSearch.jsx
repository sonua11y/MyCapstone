import React, { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import api from '../utils/api';
import '../styles/AutoCompleteSearch.css';

const AutoCompleteSearch = ({ onSearch, onSuggestionSelect, searchFields, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setSelectedSuggestion('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        setSelectedSuggestion('');
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(`/students/search?term=${encodeURIComponent(searchTerm)}`);
        setSuggestions(response.data);
        
        // Set the first suggestion as the inline suggestion
        if (response.data.length > 0) {
          const firstSuggestion = response.data[0];
          if (firstSuggestion.toLowerCase().startsWith(searchTerm.toLowerCase())) {
            setSelectedSuggestion(firstSuggestion);
          } else {
            setSelectedSuggestion('');
          }
        } else {
          setSelectedSuggestion('');
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setSelectedSuggestion('');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && selectedSuggestion && !e.shiftKey) {
      e.preventDefault();
      setSearchTerm(selectedSuggestion);
      onSuggestionSelect(selectedSuggestion);
      setSelectedSuggestion('');
    } else if (e.key === 'Enter') {
      if (selectedSuggestion) {
        setSearchTerm(selectedSuggestion);
        onSuggestionSelect(selectedSuggestion);
        setSelectedSuggestion('');
      } else {
        onSearch(searchTerm);
      }
    } else if (e.key === 'Escape') {
      setSelectedSuggestion('');
    }
  };

  return (
    <div className="autocomplete-search-wrapper" ref={searchWrapperRef}>
      <div className="autocomplete-search-input-wrapper">
        <FaSearch className="autocomplete-search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="autocomplete-search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
        {selectedSuggestion && searchTerm && selectedSuggestion.toLowerCase().startsWith(searchTerm.toLowerCase()) && (
          <div className="autocomplete-suggestion-wrapper">
            <span className="autocomplete-suggestion-text">{searchTerm}</span>
            <span className="autocomplete-suggestion-ghost">{selectedSuggestion.slice(searchTerm.length)}</span>
          </div>
        )}
      </div>
      {isLoading && (
        <div className="autocomplete-loading">
          Loading...
        </div>
      )}
    </div>
  );
};

export default AutoCompleteSearch; 