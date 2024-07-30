import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl';
import { ScatterplotLayer, GeoJsonLayer } from '@deck.gl/layers';
import * as XLSX from 'xlsx';
import { feature } from 'topojson-client';
import './DetailedMap.css'; // Import the CSS file
import InfoPanel from './InfoPanel'; // Import the InfoPanel component

const INITIAL_VIEW_STATE = {
  longitude: -95.7129,
  latitude: 37.0902,
  zoom: 3.2,
  pitch: 0,
  bearing: 0
};

const DetailedMap = () => {
  const [data, setData] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [clickedInfo, setClickedInfo] = useState(null); // Added state for clicked info
  const [selectedScale, setSelectedScale] = useState('default');
  const [selectedDciScores, setSelectedDciScores] = useState(['Distressed', 'At Risk', 'Mid-tier', 'Comfortable', 'Prosperous']);
  const [selectedColors, setSelectedColors] = useState(['15-20', '20-25', '25-30', '30-35', '35-40', '40-45', '45']);
  const [stateBoundaries, setStateBoundaries] = useState(null);

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

    const fetchStateBoundaries = async () => {
      try {
        const response = await fetch('us-states-cleaned.json');
        const topoJsonData = await response.json();
        const geoJsonData = feature(topoJsonData, topoJsonData.objects.states);
        setStateBoundaries(geoJsonData);
      } catch (error) {
        console.error('Error loading state boundaries data:', error);
      }
    };

    fetchData();
    fetchStateBoundaries();
  }, []);

  const getColor = (value) => {
    if (selectedScale === 'default') {
      if (value < 20) return '15-20';
      if (value < 25) return '20-25';
      if (value < 30) return '25-30';
      if (value < 35) return '30-35';
      if (value < 40) return '35-40';
      if (value < 45) return '40-45';
      return '45';
    } else {
      if (value < 20) return '15-20';
      if (value < 25) return '20-25';
      if (value < 30) return '25-30';
      if (value < 35) return '30-35';
      if (value < 40) return '35-40';
      if (value < 45) return '40-45';
      return '45';
    }
  };

  const getColorRGB = (value) => {
    if (selectedScale === 'default') {
      if (value < 20) return [234, 53, 70];       // Dark Red
      if (value < 25) return [255, 126, 54];      // Indian Red
      if (value < 30) return [248, 185, 32];      // Peru
      if (value < 35) return [238, 235, 32];      // Dark Orange
      if (value < 40) return [145, 205, 150];     // Golden Rod
      if (value < 45) return [78, 205, 196];      // Olive
      return [49, 130, 189];                      // Dark Green
    } else {
      if (value < 20) return [255, 0, 50];         // Red
      if (value < 25) return [255, 135, 0];       // Orange
      if (value < 30) return [255, 215, 0];       // Yellow
      if (value < 35) return [0, 178, 0];         // Green
      if (value < 40) return [0, 120, 255];       // Blue
      if (value < 45) return [148, 50, 108];      // Purple
      return [128, 128, 128];                     // Grey
    }
  };

  const filteredData = data.filter(d => 
    selectedDciScores.includes(d.dciScore) && selectedColors.includes(getColor(d.value))
  );

  const renderLayers = () => {
    return [
      new ScatterplotLayer({
        id: 'scatterplot-layer',
        data: filteredData,
        getPosition: d => d.position,
        getFillColor: d => getColorRGB(d.value),
        getRadius: d => 17000,
        radiusScale: 1,
        getLineColor: [0, 0, 0, 255],
        lineWidthMinPixels: 2, // Set the stroke width
        pickable: true,
        onHover: info => {
          if (!clickedInfo) {
            setHoverInfo(info);
          }
        },
        onClick: info => {
          setClickedInfo(info);
          setHoverInfo(null);
        }
      }),
      new GeoJsonLayer({
        id: 'geojson-layer',
        data: stateBoundaries,
        stroked: true,
        filled: false,
        lineWidthMinPixels: 1,
        getLineColor: [0, 0, 0, 255],
        pickable: false,
        visible: hoverInfo || clickedInfo ? true : false,
        updateTriggers: {
          getLineColor: [hoverInfo, clickedInfo],
        }
      })
    ];
  };

  const handleMapClick = () => {
    setClickedInfo(null);
  };

  return (
    <div onClick={handleMapClick}>
      <DeckGL
        key={selectedScale}  // Use key to force re-render
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={renderLayers()}
        style={{ width: '100%', height: '100%' }}
        onClick={handleMapClick} // To close the tooltip when clicking elsewhere
      >
        <Map
          mapStyle="mapbox://styles/mapbox/light-v10"
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>
      {(hoverInfo && hoverInfo.object) || (clickedInfo && clickedInfo.object) ? (
        <div
          id="tooltip"
          style={{
            position: 'absolute',
            zIndex: 1,
            pointerEvents: 'none',
            left: (hoverInfo || clickedInfo).x,
            top: (hoverInfo || clickedInfo).y,
            background: 'white',
            padding: '5px',
            borderRadius: '3px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            display: 'block'
          }}
        >
          <div><strong>State:</strong> {(hoverInfo || clickedInfo).object.state}</div>
          <div><strong>County:</strong> {(hoverInfo || clickedInfo).object.county}</div>
          <div><strong>W/tCO2:</strong> {(hoverInfo || clickedInfo).object.value.toFixed(1)}</div>
          <div><strong>DCI Score:</strong> {(hoverInfo || clickedInfo).object.dciScore}</div>
        </div>
      ) : null}
      <InfoPanel
        selectedScale={selectedScale}
        setSelectedScale={setSelectedScale}
        selectedDciScores={selectedDciScores}
        setSelectedDciScores={setSelectedDciScores}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
      />
    </div>
  );
};

export default DetailedMap;
