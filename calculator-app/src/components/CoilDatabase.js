import React, { useState } from 'react';
import './CoilDatabase.css';

const CoilDatabase = ({ coilData }) => {
  const [selectedGauge, setSelectedGauge] = useState('29');

  const calculateMetrics = (coil, finish) => {
    const costPerLF = coil.basePrice + (coil.finishes[finish] || 0);
    const costPerSqFt = costPerLF / (coil.width / 12);
    // Using a standard density for steel: 40.8 lbs/sq ft for 1" thick, so lbs/LF is complex.
    // Let's use a simplified weight calculation based on thickness and width.
    // Weight per LF (lbs) = width (in) * thickness (in) * 12 (in/ft) * 0.2836 (lbs/in^3) -> simplified to a factor.
    const weightFactor = 2.83; // A common approximation for steel sheeting
    const costPerLb = costPerLF / (coil.width * coil.thickness * weightFactor);
    const costPerSquare = costPerSqFt * 100;
    
    const margin = 0.45;
    const salesPerLF = costPerLF / (1 - margin);
    const salesPerSqFt = costPerSqFt / (1 - margin);
    const salesPerLb = isFinite(costPerLb) ? costPerLb / (1 - margin) : 0;
    const salesPerSquare = costPerSquare / (1 - margin);

    return {
      costPerLF, costPerSqFt, costPerLb, costPerSquare,
      salesPerLF, salesPerSqFt, salesPerLb, salesPerSquare
    };
  };

  const renderCoilTables = () => {
    if (!coilData || !coilData[selectedGauge]) {
      return <p>No data available for this gauge.</p>;
    }
    
    const coils = coilData[selectedGauge];

    return coils.map((coil, index) => (
      <div key={index} className="coil-table-container">
        <h4>{coil.name}</h4>
        <table className={`data-table gauge-${selectedGauge}`}>
          <thead>
            <tr>
              <th>Finish</th>
              <th>Cost/LF</th>
              <th>Cost/Sq Ft</th>
              <th>Cost/Lb</th>
              <th>Cost/Square</th>
              <th>Sales/LF (45%)</th>
              <th>Sales/Sq Ft (45%)</th>
              <th>Sales/Lb (45%)</th>
              <th>Sales/Square (45%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(coil.finishes).map(finish => {
              const metrics = calculateMetrics(coil, finish);
              return (
                <tr key={finish}>
                  <td>{finish.charAt(0).toUpperCase() + finish.slice(1)}</td>
                  <td>${metrics.costPerLF.toFixed(2)}</td>
                  <td>${metrics.costPerSqFt.toFixed(2)}</td>
                  <td>${metrics.costPerLb.toFixed(2)}</td>
                  <td>${metrics.costPerSquare.toFixed(2)}</td>
                  <td>${metrics.salesPerLF.toFixed(2)}</td>
                  <td>${metrics.salesPerSqFt.toFixed(2)}</td>
                  <td>${metrics.salesPerLb.toFixed(2)}</td>
                  <td>${metrics.salesPerSquare.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ));
  };

  return (
    <div className="coil-database">
      <h2>Coil Cost Database</h2>
      <div className="input-group">
        <label htmlFor="gauge-select">Select Gauge:</label>
        <select 
          id="gauge-select" 
          value={selectedGauge} 
          onChange={(e) => setSelectedGauge(e.target.value)}
        >
          <option value="29">29 Gauge</option>
          <option value="26">26 Gauge</option>
          <option value="24">24 Gauge</option>
        </select>
      </div>
      {renderCoilTables()}
    </div>
  );
};

export default CoilDatabase; 