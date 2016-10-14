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
    const annotations = this.state.stations.map(this.transformStation)
    const connections=[]
    
    return (
      <MapView
        style={{height, width}}
        region={this.state.region}
        annotations={annotations}
        overlays=[]
      />
    )
  }
}
