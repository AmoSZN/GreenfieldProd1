import React, { useState, useEffect } from 'react';
import './Calculator.css';

const TrimCalculator = ({ coilData, trimData, addJobItem }) => {
  const [inputs, setInputs] = useState({
    coil: '',
    finish: '',
    profile: '',
    quantity: 100,
    trimLength: '10-3', // Default to 10'3"
    waste: 5,
  });
  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!inputs.coil || !inputs.profile) {
      setResults(null);
      return;
    }

    const [gauge, coilIndex] = inputs.coil.split('-');
    const coil = coilData[gauge]?.[coilIndex];
    const profile = trimData[inputs.profile];
    if (!coil || !profile) return;

    // Auto-select first finish if not available
    const availableFinishes = Object.keys(coil.finishes);
    const currentFinish = availableFinishes.includes(inputs.finish) ? inputs.finish : availableFinishes[0];
     if (inputs.finish !== currentFinish) {
        setInputs(prev => ({ ...prev, finish: currentFinish}));
    }

    // Calculations
    const costPerLFCoil = coil.basePrice + (coil.finishes[currentFinish] || 0);
    const coilUsageRatio = profile.stretchOut / coil.width;
    const costPerLFTrim = costPerLFCoil * coilUsageRatio;
    
    let trimLengthFeet = 10.25;
    if (inputs.trimLength.includes('-')) {
        const [feet, inches] = inputs.trimLength.split('-').map(x => parseFloat(x) || 0);
        trimLengthFeet = feet + (inches / 12);
    } else {
        trimLengthFeet = parseFloat(inputs.trimLength) || 10.25;
    }

    const piecesNeeded = Math.ceil(inputs.quantity / trimLengthFeet);
    const actualLinearFeet = piecesNeeded * trimLengthFeet;
    const linearFeetWithWaste = actualLinearFeet * (1 + inputs.waste / 100);

    const materialCost = linearFeetWithWaste * costPerLFTrim;
    const salesPrice = materialCost / (1 - 0.45); // 45% margin

    setResults({
      coilName: coil.name,
      finish: currentFinish,
      profileName: profile.name,
      stretchOut: profile.stretchOut,
      coilUsageRatio,
      trimLengthFeet,
      piecesNeeded,
      actualLinearFeet,
      linearFeetWithWaste,
      costPerLFTrim,
      materialCost,
      salesPrice,
    });

  }, [inputs, coilData, trimData]);

  const getCoilOptions = () => {
    if (!coilData) return null;
    return Object.keys(coilData).map(gauge => (
      <optgroup label={`${gauge} Gauge`} key={gauge}>
        {coilData[gauge].map((coil, index) => (
          <option value={`${gauge}-${index}`} key={`${gauge}-${index}`}>
            {coil.name}
          </option>
        ))}
      </optgroup>
    ));
  };

  const getFinishOptions = () => {
    if (!inputs.coil) return null;
    const [gauge, coilIndex] = inputs.coil.split('-');
    const coil = coilData[gauge]?.[coilIndex];
    if (!coil) return null;
    
    return Object.keys(coil.finishes).map(finish => {
        const addCost = coil.finishes[finish];
        const addText = addCost > 0 ? ` (+$${addCost.toFixed(2)})` : addCost < 0 ? ` ($${addCost.toFixed(2)})` : ' (Base)';
        return <option value={finish} key={finish}>{finish.charAt(0).toUpperCase() + finish.slice(1)}{addText}</option>
    });
  };

  const getProfileOptions = () => {
      if (!trimData) return null;
      return trimData.map((profile, index) => (
          <option value={index} key={index}>{profile.name} ({profile.stretchOut}" stretch)</option>
      ));
  }

  return (
    <div className="calculator-container">
      <h2>Trim Calculator</h2>
      <div className="calculator-layout">
        <div className="calc-section inputs">
          <h3>Trim Selection</h3>
           <div className="input-group">
            <label>Select Coil:</label>
            <select name="coil" value={inputs.coil} onChange={handleInputChange}>
              <option value="">Choose Coil...</option>
              {getCoilOptions()}
            </select>
          </div>
          <div className="input-group">
            <label>Finish:</label>
            <select name="finish" value={inputs.finish} onChange={handleInputChange} disabled={!inputs.coil}>
              {getFinishOptions()}
            </select>
          </div>
          <div className="input-group">
            <label>Trim Profile:</label>
            <select name="profile" value={inputs.profile} onChange={handleInputChange}>
              <option value="">Choose Profile...</option>
              {getProfileOptions()}
            </select>
          </div>
          <div className="input-group">
              <label>Quantity Needed (LF):</label>
              <input type="number" name="quantity" value={inputs.quantity} onChange={handleInputChange} />
          </div>
          <div className="input-group">
              <label>Trim Length (ft-in):</label>
              <input type="text" name="trimLength" value={inputs.trimLength} onChange={handleInputChange} placeholder="e.g., 10-3"/>
          </div>
          <div className="input-group">
            <label>Waste Factor (%):</label>
            <input type="number" name="waste" value={inputs.waste} onChange={handleInputChange} />
          </div>
          <button
            className="action-button"
            onClick={() => addJobItem({
              type: 'Trim',
              description: `${results.coilName} - ${results.finish} - ${results.profileName}`,
              quantity: results.linearFeetWithWaste.toFixed(1),
              unit: 'LF',
              materialCost: results.materialCost,
              salesPrice: results.salesPrice
            })}
            disabled={!results}
          >
            Add Trim to Job
          </button>
        </div>
        <div className="calc-section results">
            <h3>Trim Calculations</h3>
            {results ? (
                <div className="results-grid">
                    <div className="result-row"><span>Selected Profile:</span> <span>{results.profileName} ({results.stretchOut}")</span></div>
                    <div className="result-row"><span>Coil Usage Ratio:</span> <span>{(results.coilUsageRatio * 100).toFixed(1)}%</span></div>
                    <div className="result-row"><span>Cost per LF (Trim):</span> <span>${results.costPerLFTrim.toFixed(2)}</span></div>
                    <div className="result-row"><span>Pieces Needed:</span> <span>{results.piecesNeeded} ({results.trimLengthFeet.toFixed(2)}' each)</span></div>
                    <div className="result-row"><span>Actual Linear Feet:</span> <span>{results.actualLinearFeet.toFixed(1)} LF</span></div>
                    <div className="result-row"><span>LF with Waste:</span> <span>{results.linearFeetWithWaste.toFixed(1)} LF</span></div>
                    <div className="result-row total-row"><span>Material Cost:</span> <span>${results.materialCost.toFixed(2)}</span></div>
                    <div className="result-row total-row"><span>Sales Price (45%):</span> <span>${results.salesPrice.toFixed(2)}</span></div>
                </div>
            ) : <p>Please select a coil and profile.</p>}
        </div>
      </div>
    </div>
  );
};

export default TrimCalculator; 