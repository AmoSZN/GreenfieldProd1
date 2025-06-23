import React from 'react';
import './JobSummary.css';

const JobSummary = ({ items, onClear, onRemove }) => {

  const totalMaterialCost = items.reduce((sum, item) => sum + item.materialCost, 0);
  const totalSalesPrice = items.reduce((sum, item) => sum + item.salesPrice, 0);
  const totalProfit = totalSalesPrice - totalMaterialCost;
  const profitMargin = totalSalesPrice > 0 ? (totalProfit / totalSalesPrice) * 100 : 0;
  
  const handlePrint = () => {
      window.print();
  }

  return (
    <div className="job-summary-container">
      <h2>Job Summary & Quote</h2>
      
      <div className="summary-actions">
          <button onClick={onClear} className="action-button clear">Clear Job</button>
          <button onClick={handlePrint} className="action-button print">Print Quote</button>
      </div>

      <div className="line-items-section">
        <h3>Line Items</h3>
        {items.length === 0 ? (
          <p>No items added yet. Use the calculators to add panels and trim.</p>
        ) : (
          <table className="summary-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Cost</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.type}</td>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>${item.materialCost.toFixed(2)}</td>
                  <td>${item.salesPrice.toFixed(2)}</td>
                  <td>
                    <button onClick={() => onRemove(index)} className="remove-button">
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="totals-section">
        <h3>Quote Summary</h3>
        <div className="summary-grid">
            <div className="result-row total-row">
                <span>Total Material Cost:</span>
                <span>${totalMaterialCost.toFixed(2)}</span>
            </div>
            <div className="result-row total-row">
                <span>Total Sales Price:</span>
                <span>${totalSalesPrice.toFixed(2)}</span>
            </div>
            <div className="result-row profit-row">
                <span>Estimated Profit:</span>
                <span>${totalProfit.toFixed(2)}</span>
            </div>
             <div className="result-row profit-row">
                <span>Profit Margin:</span>
                <span>{profitMargin.toFixed(1)}%</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default JobSummary; 