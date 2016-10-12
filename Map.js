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
      }
    }
  }

  render() {
    var {height, width} = Dimensions.get('window')
    var stations = [{title: "Times Sq - 42 St", latitude:40.75529, longitude:-73.987495},
      {title: "34 St - Penn Station", latitude: 40.750373, longitude: -73.991057}]
    return (
      <MapView
        style={{height, width}}
        region={this.state.region}
        annotations={stations}
        overlays={[{coordinates: stations, strokeColor: '#EE352E', lineWidth: 3}]}
      />
    )
  }
}
