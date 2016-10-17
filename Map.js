import React, { Component } from 'react';
import {
  MapView,
  Dimensions
} from 'react-native';

export default class Map extends Component {
  constructor() {
    super()
    this.state = {
      region: {
        latitude: 40.7565408,
        longitude: -73.9807564,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1
      },
      stations: [],
      lines: []
    }
    this.lineObjects = {}

    fetch('https://wtf-mta.herokuapp.com/stations')
    .then((response)=> response.json())
    .then((json)=> {
      let {lines, stations, lineStations} = json
      const lineToggles = {}
      lines.forEach((line)=> {
        lineToggles[line.name] = true
      })
      stations = stations.map((station)=>{
        const stationLS = lineStations.filter((ls)=>ls.station_id === station.id)
        station.lines = stationLS.map((ls)=>lines.find((line)=>line.id === ls.line_id))
        station.order = []
        return station
      })
      lines = lines.map((line)=>{
        const lineLS = lineStations.filter((ls)=>ls.line_id === line.id)
        line.stations = lineLS.map((ls)=>{
          const station = stations.find((station)=>station.id === ls.station_id)
          station.order[ls.line_id] = ls.order
          return station
        }).sort((a,b)=> a.order[line.id] - b.order[line.id])
        return line
      })

      this.setState({
        lines: lines,
        stations: stations,
        lineToggles: lineToggles
      })
    })
  }

  offsetStationPosition(station, lat_offset, lng_offset) {
    return {
      lat: station.lat + lat_offset,
      lng: station.lng + lng_offset
    }
  }

  drawLinesBetween(station, other_station) {
    const name = [station.mta_id, other_station.mta_id].sort().join('_')
    const lines = this.getConnectingLines(station, other_station).sort((a,b) => a.line_id > b.line_id ? 1 : -1)
    const angle = Math.atan((station.lng - other_station.lng) / (other_station.lat - station.lat))
    const lat_offset = Math.sin(angle)
    const lng_offset = Math.cos(angle)
    return lines.reduce((result,line, i) => {
      const factor = (i - (lines.length / 2)) / 10000
      const coords = [this.offsetStationPosition(station, lat_offset * factor, lng_offset * factor), this.offsetStationPosition(other_station, lat_offset * factor, lng_offset * factor)]
      result[line.name] = {coordinates: coords, lineWidth: 2}
      return result
    }, {})
  }

  getConnectingLines(a,b) {
    return a.lines.filter((aline)=>b.lines.find((bline)=>bline === aline))
  }

  getStationConnections(station) {
    return station.order.reduce((result, _, line_id) => {
      const line = station.lines.find((line)=>line.id === line_id)
      const idx = line.stations.indexOf(station)
      if (idx > 0) result.push(line.stations[idx - 1])
      if (idx < line.stations.length - 1) result.push(line.stations[idx + 1])
      return result
    }, [])
  }

  transformStation(station) {
    return {title: station.name, latitude: station.lat, longitude: station.lng}
  }

  render() {
    const {height, width} = Dimensions.get('window')
    const stationMarkers = this.state.stations.map(this.transformStation)
    const lineSegments = this.state.stations.reduce((lineSegments, station) => lineSegments + this.getStationConnections(station).map((lines, other_station)=> lines + this.drawLinesBetween(station, other_station)), [])

    return (
      <MapView
        style={{height, width}}
        region={this.state.region}
        annotations={stationMarkers}
        overlays={lineSegments}
      />
    )
  }
}
