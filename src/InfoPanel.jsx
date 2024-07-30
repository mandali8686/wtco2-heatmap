import React from 'react';
import './InfoPanel.css';

const infoPanelContent = {
  wtc02: {
    title: "W/tCO2 Heatmap",
    description: "This heatmap visualizes the W/tCO2 values across different regions. Use the Checkbox below to filter specific W/tCO2 ranges and DCI groups. Zoom in and hover the data points to see detailed information.",
    legendItems: {
      default: [
        { color: 'rgb(234, 53, 70)', label: '>= 15, < 20', value: '15-20' },
        { color: 'rgb(255, 126, 54)', label: '>= 20, < 25', value: '20-25' },
        { color: 'rgb(248, 185, 32)', label: '>= 25, < 30', value: '25-30' },
        { color: 'rgb(238, 235, 32)', label: '>= 30, < 35', value: '30-35' },
        { color: 'rgb(145, 205, 150)', label: '>= 35, < 40', value: '35-40' },
        { color: 'rgb(78, 205, 196)', label: '>= 40, < 45', value: '40-45' },
        { color: 'rgb(49, 130, 189)', label: '>= 45', value: '45' }
      ],
      master: [
        { color: 'rgb(255, 0, 50)', label: '>= 15, < 20', value: '15-20' },
        { color: 'rgb(255, 135, 0)', label: '>= 20, < 25', value: '20-25' },
        { color: 'rgb(255, 215, 0)', label: '>= 25, < 30', value: '25-30' },
        { color: 'rgb(0, 178, 0)', label: '>= 30, < 35', value: '30-35' },
        { color: 'rgb(0, 120, 255)', label: '>= 35, < 40', value: '35-40' },
        { color: 'rgb(148, 50, 108)', label: '>= 40, < 45', value: '40-45' },
        { color: 'rgb(128, 128, 128)', label: '>= 45', value: '45' }
      ]
    }
  }
};

const InfoPanel = ({ selectedScale, setSelectedScale, selectedDciScores, setSelectedDciScores, selectedColors, setSelectedColors }) => {
  const content = infoPanelContent.wtc02;

  const handleDciScoreCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedDciScores((prev) => [...prev, value]);
    } else {
      setSelectedDciScores((prev) => prev.filter((score) => score !== value));
    }
  };

  const handleColorCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedColors((prev) => [...prev, value]);
    } else {
      setSelectedColors((prev) => prev.filter((color) => color !== value));
    }
  };

  return (
    <div className="info-panel">
      <h2>{content.title}</h2>
      <p>{content.description}</p>
      <h4>Switch Color Scales.</h4>
      <div className="radio-group">
        <label>
          <input
            type="radio"
            value="default"
            checked={selectedScale === 'default'}
            onChange={() => setSelectedScale('default')}
          />
          Default W/tCO2 Color
        </label>
        <label>
          <input
            type="radio"
            value="master"
            checked={selectedScale === 'master'}
            onChange={() => setSelectedScale('master')}
          />
          Master Dataset Color
        </label>
      </div>
      <h4>DCI Score Groups</h4>
      <div className="checkbox-group">
        {['Distressed', 'At Risk', 'Mid-tier', 'Comfortable', 'Prosperous'].map((score) => (
          <label key={score}>
            <input
              type="checkbox"
              value={score}
              checked={selectedDciScores.includes(score)}
              onChange={handleDciScoreCheckboxChange}
            />
            {score}
          </label>
        ))}
      </div>
      <h4>W/tCO2 Groups(Min: 17.5, Max: 67.7)</h4>
      <div className="legend">
        {content.legendItems[selectedScale].map((item, index) => (
          <div key={index} className="legend-item">
            <label>
              <input
                type="checkbox"
                value={item.value}
                checked={selectedColors.includes(item.value)}
                onChange={handleColorCheckboxChange}
              />
              <div className="color-box" style={{ backgroundColor: item.color }}></div>
              <span>{item.label}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoPanel;
