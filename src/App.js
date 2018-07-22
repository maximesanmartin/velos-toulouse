import React, { Component } from 'react'
import axios from 'axios'
import logo from './logo.svg'
import styled from 'styled-components'
import { switchProp } from 'styled-tools'
import { compose, withProps, withStateHandlers } from 'recompose'
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps'
import { MarkerClusterer } from 'react-google-maps/lib/components/addons/MarkerClusterer'

import './App.css'

const OPEN = 'OPEN'
const CLOSED = 'CLOSED'


const CardContainer = styled.div`
  border: 1px solid lightgrey;
  width: 250px;
  text-align: left;

  .status {
    color: ${switchProp('status', {
      [OPEN]: 'green',
      [CLOSED]: 'red'
    }, 'black')};
  }
`

const CardHeader = styled.div`
  padding: 0.3em;
  border: 1px solid lightgrey;
  background-color: grey;
  color: 'white';
`

const CardBody = styled.div`
  padding: 0.3em;
`

const switchStatus = switchProp('status', {
  [OPEN]: 'Ouvert',
  [CLOSED]: 'Fermé'
}, 'Inconnu')

const StationCard = ({address, available_bike_stands, available_bikes, name, position, status}) => (
  <CardContainer status={status}>
    <CardHeader>{name}</CardHeader>
    <CardBody>
      <p>Adresse: {address}</p>
      <p>Nombre de vélos restant: {available_bike_stands}</p>
      <p>Nombre de vélos disponibles: {available_bikes}</p>
      <p>Statut: <b className='status'>{switchStatus({status})}</b></p>
    </CardBody>
  </CardContainer>
)

const ClickableMarker = compose(
  withStateHandlers(() => ({
    isOpen: false,
  }), {
    onToggleOpen: ({ isOpen }) => () => ({
      isOpen: !isOpen,
    })
  })
)(props =>
  <Marker
    position={props.position}
    onClick={props.onToggleOpen}
  >
    {props.isOpen && <InfoWindow onCloseClick={props.onToggleOpen}>
      <React.Fragment>
        <CardHeader>{props.name}</CardHeader>
        <CardBody>
          <p>Adresse: {props.address}</p>
          <p>Points d'attache disponibles: {props.available_bike_stands}</p>
          <p>Points d'attache opérationnels: {props.bike_stands}</p>
          <p>Nombre de vélos disponibles: {props.available_bikes}</p>
          <p>Statut: <b className='status'>{switchStatus({status: props.status})}</b></p>
        </CardBody>
      </React.Fragment>
    </InfoWindow>}
  </Marker>
)

const BikesMap = compose(
  withProps({
    googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places',
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `700px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
    onMarkerClick: (info) => { console.log(info) }
  }),
  withScriptjs,
  withGoogleMap
)((props) =>
  <GoogleMap
    defaultZoom={13}
    defaultCenter={{ lat: 43.6006786, lng: 1.43 }}
  >
    <MarkerClusterer
      onClick={props.onMarkerClustererClick}
      averageCenter
      enableRetinaIcons
      gridSize={60}
    >
      {props.stations.map(station =>
        <ClickableMarker {...station} />
      )}
    </MarkerClusterer>
  </GoogleMap>
)

const Presentation = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    }
  }

  componentDidMount () {
    this.getStations()
  }

  getStations = () => {
    axios.get('https://api.jcdecaux.com/vls/v1/stations', {
      params: {
        apiKey: 'fa0f33a05b3cd752b7b5b3fafc49fed82bc333b7',
        contract: 'Toulouse'
      }
    }).then(({data}) => { this.setState({data}) })
  }

  render() {
    return (
      <div className="App">
        <BikesMap stations={this.state.data} />
        <Presentation>{this.state.data.length === 0
          ? 'Loading...'
          : this.state.data.map(station => <StationCard key={station.name} {...station} />)}
        </Presentation>
      </div>
    );
  }
}

export default App
