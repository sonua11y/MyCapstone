import React, { useState } from 'react';
import Header from '../components/Header';
import MetricsData from '../components/MetricsData';
import AdmissionChart from '../components/AdmissionChart';
import TenKTable from '../components/TenKTable';
import FeeCollectionStatus from '../components/FeeCollectionStatus';
import CentralContent from '../components/CentralContent';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import '../styles/app.css';

const Index = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [activeSubTab, setActiveSubTab] = useState('10k');
  const [activeCentralSubTab, setActiveCentralSubTab] = useState('previous');
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);

  const handleMonthSelect = (month) => {
    setSelectedMonth(month === selectedMonth ? null : month);
  };

  const handleCollegeSelect = (college) => {
    setSelectedCollege(college);
  };

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <MetricsData />
        
        <div className="tabs-container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-wrapper">
            <TabsList className="tabs-list">
              <TabsTrigger 
                value="admin" 
                className={`tab-item ${activeTab === 'admin' ? 'active' : ''}`}
              >
                Admission Progress
              </TabsTrigger>
              <TabsTrigger 
                value="central" 
                className={`tab-item ${activeTab === 'central' ? 'active' : ''}`}
              >
                Aerial View
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="admin">
              <div className="sub-tabs-container">
                <ul className="sub-tabs-list">
                  <li 
                    className={`sub-tab-item ${activeSubTab === '10k' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSubTab('10k');
                      setSelectedMonth(null);
                    }}
                  >
                    Seat Block Fee (10k)
                  </li>
                  <li 
                    className={`sub-tab-item ${activeSubTab === 'sem-fee' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSubTab('sem-fee');
                      setSelectedMonth(null);
                    }}
                  >
                    University Fee
                  </li>
                </ul>
              </div>

              {activeSubTab === '10k' ? (
                <>
                  <AdmissionChart onCollegeSelect={handleCollegeSelect} selectedCollege={selectedCollege} />
                  <TenKTable selectedCollege={selectedCollege} />
                </>
              ) : (
                <FeeCollectionStatus onMonthSelect={handleMonthSelect} selectedMonth={selectedMonth} />
              )}
            </TabsContent>
            
            <TabsContent value="central">
              <div className="sub-tabs-container">
                <ul className="sub-tabs-list">
                  <li 
                    className={`sub-tab-item ${activeCentralSubTab === 'previous' ? 'active' : ''}`}
                    onClick={() => setActiveCentralSubTab('previous')}
                  >
                    Previous Years
                  </li>
                  <li 
                    className={`sub-tab-item ${activeCentralSubTab === 'year2025' ? 'active' : ''}`}
                    onClick={() => setActiveCentralSubTab('year2025')}
                  >
                    Year 2025
                  </li>
                </ul>
              </div>
              
              <CentralContent activeSubTab={activeCentralSubTab} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index; 