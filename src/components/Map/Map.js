import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import './MapStyle.scss';
import * as utility from './utility';
import Papa from 'papaparse';
import * as d3 from 'd3';
import logo from '../../logo1.png';
import { Menu, MenuItem, IconButton, Collapse } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import CloseIcon from '@material-ui/icons/Close';
import {fetchMap} from "./MapActions";

function Map() {
  // FIXME you are using leaflet but you haven't imported it in this component because you have put it in index.html
  // try to use react leaflet and help encapsulation components (and Separation of concerns)

  const [chosenMap, setChosenMap] = useState(null);
  const [map, setMap] = useState(null);
  const [data, setData] = useState([]);
  const [label, setLabel] = useState([]);
  const [zoom, setZoom] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [vpnAlert, setVpnAlert] = useState(true);

  const { isMapFetching, mapList } = useSelector(state => state.Map);
  const dispatch = useDispatch();

  const drawPolygon = useCallback((color, polygons) => {
    map &&
      polygons &&
      window.L.polygon(polygons, {
        fillColor: `#${Number(color).toString(16)}`,
        fill: true,
        stroke: false,
        fillOpacity: 0.4,
      }).addTo(map);
  }, [map]);

  const clearPolygon = useCallback(() => {
    if (map) {
      d3.selectAll('.leaflet-interactive').remove();

    }
  }, [map]);

  const clearLabel = useCallback(() => {
    if (map) {
      d3.selectAll('.leaflet-tooltip').remove();
    }
  }, [map]);

  //  TODO explain about the code (Explain the goal for each section to help other developers).
  const getData = (result) => {
    setIsDataFetching(false);
    const line = result.data;
    const lineNumber = line.length;
    for (let i = 0; i < lineNumber; ) {
      if (line[i].length === 1) {
        let j = i + 1;
        let polygons = [];
        let labels = [];
        while (j < lineNumber && line[j].length > 1) {
          if (!isNaN(line[j][0])){
            polygons.push(line[j]);
          }
          else if (line[j][0] === 'L'){
            labels.push({
              text: line[j][1],
              point: [line[j][2], line[j][3]],
              size: line[j][4],
              color: `#${Number(line[j][5]).toString(16)}`,
            })
          }
          else if ( line[j][0] === 'P') {
            polygons.push(line[j].splice(1));
          }
          j++;
        }
        let sameColor = {};
        for (let k = 0; k < polygons.length; ) {
          let color = polygons[0][0];
          if (polygons[k][0] === color) {
            let points = [];
            let temp = polygons[k].slice(1);
            for (let k = 0; k < temp.length; k += 2) {
              points.push([temp[k], temp[k + 1]]);
            }
            if (color in sameColor) sameColor[color].push([points]);
            else sameColor[color] = [points];
            polygons.splice(k, 1);
            k = 0;
          } else {
            k++;
          }
        }
        setData((prevData) => [...prevData, [Number(line[i][0]), sameColor]]);
        if (labels.length > 0) setLabel((prevLabel => [...prevLabel, [Number(line[i][0]), labels]]));
        i = j;
      }
    }
  };

  const parseFile = useCallback((url) => {
    setData([]);
    setIsDataFetching(true);
    Papa.parse(url, {
      download: true,
      complete: getData,
    });
  }, []);

  const findZoomLevels = useCallback( () => {
    const result = [];
    data.forEach(element => result.push(element[0]));
    return result
  }, [data]);

  const findZoom = useCallback(() => {
    const inverseZoomLevel = 10 * Math.pow(2, -(map && map.getZoom()));
    const zoomLevels = data && findZoomLevels();
    for (let i = 0; i < zoomLevels.length - 1; i++) {
      if (inverseZoomLevel <= zoomLevels[i]) {
        setZoom(i);
        break;
      } else if (
          inverseZoomLevel > zoomLevels[i] &&
          inverseZoomLevel <= zoomLevels[i + 1]
      ) {
        setZoom(i + 1);
        break;
      } else {
        setZoom(zoomLevels.length - 1)
      }
    }
  }, [map, data, findZoomLevels]);

  useEffect(() => {
    findZoom();
  }, [findZoom, data]);

  useEffect(() => {
    map &&
    map.on('zoom', function () {
      findZoom();
    });
  });

  useEffect(() => {
    dispatch(fetchMap());
    setMap(
      new window.L.Map('map', {
        key: process.env.REACT_APP_MAP_TOKEN,
        maptype: 'dreamy',
        poi: true,
        traffic: false,
        zoomControl: false,
        center: [32.4279, 53.688],
        zoom: 4.2,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    mapList && setChosenMap(mapList[0]);
  }, [mapList]);

  useEffect(() => {
    let version;
    if (mapList) {
      for (let i = 0; i < mapList.length; i++) {
        if ((mapList[i] || {}).id === chosenMap.id) {
          version = mapList[i].version;
        }
      }
    }
    version &&
      parseFile(
        `${process.env.REACT_APP_MAP_CDN}${chosenMap.id}.${version}.csv`
      );
  }, [chosenMap]);

  useEffect(() => {
    clearPolygon();
    if (!((data || {})[zoom] || [])[1]) {
      return;
    }
    for (let key in data[zoom][1]) {
      if (Object.prototype.hasOwnProperty.call(data[zoom][1], key))
        drawPolygon(key, (data[zoom][1][key]));
    }
  }, [map, zoom, data, clearPolygon, drawPolygon]);

  useEffect(() => {
    clearLabel();
    if (!((label || {})[zoom] || [])[1]) {
      return;
    }
    // TODO clean this shit
    let root = document.documentElement;
    root.style.setProperty('--label-color', label[zoom][1][0].color);
    root.style.setProperty('--label-size', label[zoom][1][0].size);
    for (let entry of label[zoom][1]){
      window.L.marker(entry.point, {
        opacity: 0,
      }).bindTooltip(entry.text, {
        permanent: true,
        className: 'map-label',
        direction: 'top',
      }).addTo(map);
    }
  }, [map, label, zoom, clearLabel]);

  const handleLocate = async () => {
    const myLatLngLocation = await utility.getCurrentPosition();
    map.flyTo(myLatLngLocation, 15);
  };

  const clickMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = (value) => {
    value && setChosenMap(value);
    setAnchorEl(null);
  };

  const renderMenu = () => { return (
    <Menu
      classes={{
        paper: 'map-menu',
      }}
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={() => closeMenu()}
    >
      {mapList &&
        mapList.map((item) => {
          return (
            <MenuItem
              classes={{ root: 'map-menu-item' }}
              onClick={() => closeMenu(item)}
            >
              {item.name}
            </MenuItem>
          );
        })}
    </Menu>
  ); };

  return (
    <div className={`contentWrapper MapWrapper`}>
      <div className="alerts">
        <Collapse className="map-alert-wrapper" in={isDataFetching || isMapFetching} addEndListener={null}>
          <Alert
            severity="info"
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => {
                  setIsDataFetching(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            تا دریافت اطلاعات منتظر بمانید.
          </Alert>
        </Collapse>
        <Collapse className="map-alert-wrapper" in={vpnAlert} addEndListener={null}>
          <Alert
            severity="warning"
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => {
                  setVpnAlert(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            در صورت اتصال، vpn دستگاه را قطع کنید.
          </Alert>
        </Collapse>
      </div>
      <div className="map-button-wrapper">
        <button
          type="button"
          className="map-button"
          onClick={() => handleLocate()}
        >
          <MyLocationIcon />
        </button>
        <button
          type="button"
          name="chosenMap"
          className="map-button type"
          onClick={(e) => clickMenu(e)}
        >
          <div>{(chosenMap || {}).name}</div>
          <ExpandMoreIcon />
        </button>
      </div>
      {/* TODO config file */}
      <div
        id="map"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
        }}
      />
      <div className="comment-wrapper">
        <div className="map-comment">{(chosenMap || {}).comment}</div>
      </div>
      <div className="logo-wrapper">
        <img src={logo} alt="" />
      </div>
      {renderMenu()}
    </div>
  );
}

export default Map;
