import React, { useState, useEffect } from 'react';
import CoilDatabase from './components/CoilDatabase';
import PanelCalculator from './components/PanelCalculator';
import TrimCalculator from './components/TrimCalculator';
import JobSummary from './components/JobSummary';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('coil-database');
  const [coilData, setCoilData] = useState(null);
  const [trimData, setTrimData] = useState(null);
  const [jobItems, setJobItems] = useState(() => {
    try {
      const savedItems = localStorage.getItem('jobItems');
      return savedItems ? JSON.parse(savedItems) : [];
    } catch (error) {
      console.error("Could not parse job items from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    // Fetch data
    fetch('/coils.json').then(res => res.json()).then(setCoilData);
    fetch('/trims.json').then(res => res.json()).then(setTrimData);
  }, []);

  useEffect(() => {
    // Save job items to localStorage
    try {
      localStorage.setItem('jobItems', JSON.stringify(jobItems));
    } catch (error) {
      console.error("Could not save job items to localStorage", error);
    }
  }, [jobItems]);

  const addJobItem = (item) => {
    setJobItems(prevItems => [...prevItems, item]);
    setActiveTab('job-summary'); // Switch to summary tab after adding an item
  };

  const removeJobItem = (indexToRemove) => {
    setJobItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  };

  const clearJob = () => {
    setJobItems([]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'coil-database':
        return <CoilDatabase coilData={coilData} />;
      case 'panel-calc':
        return <PanelCalculator coilData={coilData} addJobItem={addJobItem} />;
      case 'trim-calc':
        return <TrimCalculator coilData={coilData} trimData={trimData} addJobItem={addJobItem} />;
      case 'job-summary':
        return <JobSummary items={jobItems} onClear={clearJob} onRemove={removeJobItem} />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <h1>Panel & Trim Cost Calculator</h1>
      <div className="tab-buttons">
        <button className={activeTab === 'coil-database' ? 'active' : ''} onClick={() => setActiveTab('coil-database')}>Coil Database</button>
        <button className={activeTab === 'panel-calc' ? 'active' : ''} onClick={() => setActiveTab('panel-calc')}>Panel Calculator</button>
        <button className={activeTab === 'trim-calc' ? 'active' : ''} onClick={() => setActiveTab('trim-calc')}>Trim Calculator</button>
        <button className={activeTab === 'job-summary' ? 'active' : ''} onClick={() => setActiveTab('job-summary')}>
          Job Summary <span className="item-count">({jobItems.length})</span>
        </button>
      </div>
      <div className="tab-content">
        {coilData && trimData ? renderTabContent() : <div>Loading data...</div>}
      </div>
    </div>
  );
}

export default App;
