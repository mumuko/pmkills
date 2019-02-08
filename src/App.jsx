import React, { Component } from 'react'
import styled from 'styled-components'
import GoogleMapReact from 'google-map-react'
import { fitBounds } from 'google-map-react/utils'
import { geolocated } from 'react-geolocated'

const Container = styled.div`
  display: flex;
  flex-wrap: nowrap;
  padding: 20px;
  background: ${props => (props.mode ? 'black' : 'white')};
  color: ${props => (props.mode ? 'white' : '#4d4d4d')};
`

const Wrapper = styled.div`
  width: 50%;
  height: 100vh;
  padding: 20px 10px;
`

const Button = styled.button`
  padding: 5px 30px;
  margin: 0 10px 0 0;
  background: transparent;
  cursor: pointer;
  border: 1px solid;
  border-color: #4d4d4d;
  &:focus,
  &:active {
    outline: 0;
  }
  &:hover {
    border-color: #ff9800;
    color: #ff9800;
  }
`

const Site = styled.div`
  background: grey;
  padding: 6px 6px;
  display: inline-flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  transform: translate(-50%, -50%);
`

const Box = styled.div`
  box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.2);
  padding: 15px 10px;
  margin: 10px 0;
`

const Tag = styled.div`
  display: inline-box;
  border: 1px solid;
  border-color: ${props =>
    props.isSelected && props.showDetail ? '#ff9800' : '#4d4d4d'};
  color: ${props =>
    props.isSelected && props.showDetail ? '#ff9800' : '#4d4d4d'};
  margin: 5px 5px 0 0;
  padding: 2px 4px;
  cursor: pointer;
  &:hover {
    border-color: #ff9800;
    color: #ff9800;
  }
`

const SingleTag = styled.div`
  display: inline-box;
  border: 1px solid;
  border-color: #ff9800;
  color: #ff9800;
  margin: 5px 5px 0 0;
  padding: 2px 4px;
`

const Text = styled.div`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`

const Info = styled.div`
  margin-top: 10px;
  div {
    margin: 2px 0;
  }
`

const Status = ({ status }) => {
  switch (status) {
    case '良好':
      return <Text>🙂良好</Text>
    case '普通':
      return <Text>😐普通</Text>
    case '對敏感族群不健康':
      return <Text>😷對敏感族群不健康</Text>
    case '對所有族群不健康':
      return <Text>🤢對所有族群不健康</Text>
    default:
      return ''
  }
}

const Detail = ({ feed }) => {
  return (
    <Info>
      <div>位置：{feed.County}</div>
      <div>更新時間：{feed.PublishTime}</div>
      <div>PM 2.5：{feed.PM2_5}</div>
      <div>AQI：{feed.AQI}</div>
    </Info>
  )
}

class App extends Component {
  state = {
    isHome: true,
    mode: false,
    feeds: [],
    sites: [],
    selectedFeed: { Latitude: 0, Longitude: 0 },
    center: {},
    zoom: 0,
    showDetail: false
  }
  findCenterAndZoom = feeds => {
    const feedSites = feeds.map(feed => {
      return {
        lat: parseFloat(feed.Latitude),
        lng: parseFloat(feed.Longitude)
      }
    })
    const maxLatitudeFeed = feedSites.sort((a, b) => {
      return b.lat - a.lat
    })[0]
    const maxLongitudeFeed = feedSites.sort((a, b) => {
      return b.lng - a.lng
    })[0]
    const minLatitudeFeed = feedSites.sort((a, b) => {
      return a.lat - b.lat
    })[0]
    const minLongitudeFeed = feedSites.sort((a, b) => {
      return a.lng - b.lng
    })[0]

    const nw = {
      lat: maxLatitudeFeed.lat,
      lng: minLongitudeFeed.lng
    }
    const se = {
      lat: minLatitudeFeed.lat,
      lng: maxLongitudeFeed.lng
    }
    const bounds = {
      nw,
      se
    }
    const size = {
      width: 436, // Map width in pixels
      height: 747 // Map height in pixels
    }
    const { center, zoom } = fitBounds(bounds, size)
    this.setState({
      center: center,
      zoom: zoom
    })
  }

  componentDidMount() {
    fetch('https://pm25.lass-net.org/data/last-all-epa.json')
      .then(res => res.json())
      .then(result => {
        const feed =
          result.feeds[Math.floor(Math.random() * result.feeds.length)]
        this.setState({
          feeds: result.feeds,
          selectedFeed: feed,
          sites: [feed]
        })
        this.findCenterAndZoom(result.feeds)
      })
  }
  handleModeClick = () => {
    this.setState({ mode: !this.state.mode })
  }
  handleCountyClick = feed => {
    this.setState({
      center: {
        lat: parseFloat(feed.Latitude),
        lng: parseFloat(feed.Longitude)
      },
      zoom: 11,
      selectedFeed: feed,
      showDetail: true,
      isSelected: true
    })
  }
  handleDisplayClick = index => {
    const { feeds, selectedFeed, isHome } = this.state
    if (isHome) {
      this.setState({
        sites: feeds
      })
      this.findCenterAndZoom(feeds)
    } else {
      this.setState({
        sites: [selectedFeed],
        center: {
          lat: parseFloat(selectedFeed.Latitude),
          lng: parseFloat(selectedFeed.Longitude)
        },
        zoom: 11
      })
    }
    this.setState({ isHome: !isHome, showDetail: false })
  }
  render() {
    const {
      isHome,
      mode,
      feeds,
      selectedFeed,
      sites,
      center,
      zoom,
      showDetail
    } = this.state
    const DarkMapStyle = {
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        {
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#242f3e' }]
        },
        {
          elementType: 'labels.text.fill',
          stylers: [{ color: '#746855' }]
        },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#263c3f' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6b9a76' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#38414e' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#212a37' }]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9ca5b3' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#746855' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#1f2835' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#f3d19c' }]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#2f3948' }]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#17263c' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#515c6d' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#17263c' }]
        }
      ]
    }
    return (
      <Container mode={mode ? 1 : 0}>
        <Wrapper>
          <Button onClick={this.handleDisplayClick}>
            {isHome ? '顯示所有觀測站' : '顯示最近觀測站'}
          </Button>
          <Button onClick={this.handleModeClick}>
            {mode ? 'LIGHT' : 'DARK'} MODE
          </Button>
          {isHome ? (
            <Box>
              <Status status={selectedFeed.Status} />
              <SingleTag>{selectedFeed.SiteName}</SingleTag>
              <Detail feed={selectedFeed} />
            </Box>
          ) : (
            <>
              {['良好', '普通', '對敏感族群不健康', '對所有族群不健康'].map(
                status => (
                  <Box>
                    <Status status={status} />
                    {feeds
                      .filter(feed => feed.Status === status)
                      .map((feed, index) => (
                        <Tag
                          key={feed.SiteName}
                          onClick={() => this.handleCountyClick(feed)}
                          isSelected={selectedFeed === feed}
                          showDetail={showDetail}
                        >
                          {feed.SiteName}
                        </Tag>
                      ))}
                    {showDetail && selectedFeed.Status === status ? (
                      <Detail feed={selectedFeed} />
                    ) : (
                      ''
                    )}
                  </Box>
                )
              )}
            </>
          )}
        </Wrapper>
        <Wrapper>
          <GoogleMapReact
            bootstrapURLKeys={{
              key: 'AIzaSyBeMywQgE0IADmdAgYwa_y5yP5frHuBFZY'
            }}
            defaultCenter={{ lat: 23.5, lng: 121 }}
            defaultZoom={11}
            center={center}
            zoom={zoom}
            options={mode ? DarkMapStyle : ''}
          >
            {sites.map(feed => (
              <Site
                key={feed.SiteName}
                site={feed.SiteName}
                lat={feed.Latitude}
                lng={feed.Longitude}
                stat={feed.Status}
              />
            ))}
          </GoogleMapReact>
        </Wrapper>
      </Container>
    )
  }
}

export default geolocated()(App)
