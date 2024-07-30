import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl';
import { ScatterplotLayer } from '@deck.gl/layers';
import * as XLSX from 'xlsx';
import './DetailedMap.css'; // Import the CSS file
import InfoPanel from './InfoPanel'; // Import the InfoPanel component

const INITIAL_VIEW_STATE = {
  longitude: -95.7129,
  latitude: 37.0902,
  zoom: 3.5,
  pitch: 0,
  bearing: 0
};

const DetailedMap = () => {
  const [data, setData] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedScale, setSelectedScale] = useState('default');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the data points
        const response = await fetch('/Screening_Tool_2024 Projects.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = 'Master Dataset (USE THIS!)';
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const processedData = jsonData.map(d => ({
          position: [d.Longitude, d.Latitude],
          county: d.COUNTY,
          state: d.State,
          value: d['W/tCO2'],
          dciScore: d['2024 DCI Score (2017-2021)   "N/A" = <500 residents']
        }));

        setData(processedData);
      } catch (error) {
        console.error('Error loading Excel data:', error);
      }
    };

    fetchData();
  }, []);

  const getColor = (value) => {
    // console.log('selectedScale:', selectedScale);
    if (selectedScale === 'default') {
      if (value < 20) return [234, 53, 70];       // Dark Red
      if (value < 25) return [255, 126, 54];      // Indian Red
      if (value < 30) return [248, 185, 32];      // Peru
      if (value < 35) return [238, 235, 32];      // Dark Orange
      if (value < 40) return [145, 205, 150];     // Golden Rod
      if (value < 45) return [78, 205, 196];      // Olive
      return [49, 130, 189];                      // Dark Green
    } else {
      if (value < 20) return [255, 0, 0];         // Red
      if (value < 25) return [255, 145, 0];       // Orange
      if (value < 30) return [255, 215, 0];       // Yellow
      if (value < 35) return [0, 158, 0];         // Green
      if (value < 40) return [0, 100, 255];         // Blue
      if (value < 45) return [128, 0, 128];       // Purple
      return [128, 128, 128];                     // Grey
    }
  };

  const renderLayers = () => {
    return [
      new ScatterplotLayer({
        id: 'scatterplot-layer',
        data,
        getPosition: d => d.position,
        getFillColor: d => {
          const color = getColor(d.value);
        //   console.log('Data point color:', color);
          return color;
        },
        getRadius: d => 20000,
        radiusScale: 1,
        getLineColor: [0, 0, 0, 255],
        lineWidthMinPixels: 2, // Set the stroke width
        pickable: true,
        onHover: info => setHoverInfo(info)
      })
    ];
  };

  return (
    <div>
      <DeckGL
        key={selectedScale}  // Use key to force re-render
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={renderLayers()}
        style={{ width: '100%', height: '100%' }}
      >
        <Map
          mapStyle="mapbox://styles/mapbox/light-v10"
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>
      {hoverInfo && hoverInfo.object && (
        <div
          id="tooltip"
          style={{
            position: 'absolute',
            zIndex: 1,
            pointerEvents: 'none',
            left: hoverInfo.x,
            top: hoverInfo.y,
            background: 'white',
            padding: '5px',
            borderRadius: '3px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            display: 'block'
          }}
        >
          <div><strong>State:</strong> {hoverInfo.object.state}</div>
          <div><strong>County:</strong> {hoverInfo.object.county}</div>
          <div><strong>W/tCO2:</strong> {hoverInfo.object.value.toFixed(1)}</div>
          <div><strong>DCI Score:</strong> {hoverInfo.object.dciScore}</div>
        </div>
      )}
      <InfoPanel selectedScale={selectedScale} setSelectedScale={setSelectedScale} />
    </div>
  );
};

export default DetailedMap;
