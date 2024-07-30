import React from 'react';
import './InfoPanel.css';

const infoPanelContent = {
  wtc02: {
    title: "W/tCO2 Heatmap",
    description: "This heatmap visualizes the W/tCO2 values across different regions.",
    legendItems: {
      default: [
        { color: 'rgb(234, 53, 70)', label: '>= 15, < 20' },
        { color: 'rgb(255, 126, 54)', label: '>= 20, < 25' },
        { color: 'rgb(248, 185, 32)', label: '>= 25, < 30' },
        { color: 'rgb(238, 235, 32)', label: '>= 30, < 35' },
        { color: 'rgb(145, 205, 150)', label: '>= 35, < 40' },
        { color: 'rgb(78, 205, 196)', label: '>= 40, < 45' },
        { color: 'rgb(49, 130, 189)', label: '>= 45' }
      ],
      master: [
        { color: 'rgb(255, 0, 0)', label: '>= 15, < 20' },
        { color: 'rgb(255, 165, 0)', label: '>= 20, < 25' },
        { color: 'rgb(255, 255, 0)', label: '>= 25, < 30' },
        { color: 'rgb(0, 128, 0)', label: '>= 30, < 35' },
        { color: 'rgb(0, 0, 255)', label: '>= 35, < 40' },
        { color: 'rgb(128, 0, 128)', label: '>= 40, < 45' },
        { color: 'rgb(128, 128, 128)', label: '>= 45' }
      ]
    }
  }
};

const InfoPanel = ({ selectedScale, setSelectedScale }) => {
  const content = infoPanelContent.wtc02;

  return (
    <div className="info-panel">
      <h2>{content.title}</h2>
      <p>{content.description}</p>
      <h4>Use the radio ubtton below to switch color scales.</h4>
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
      <div className="legend">
        {content.legendItems[selectedScale].map((item, index) => (
          <div key={index} className="legend-item">
            <div className="color-box" style={{ backgroundColor: item.color }}></div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoPanel;
