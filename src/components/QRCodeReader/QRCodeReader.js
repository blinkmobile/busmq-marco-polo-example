import React, { Component, PropTypes } from 'react'
import QrCode from 'qrcode-reader'
import 'md-gum-polyfill'

import classes from './QRCodeReader.css'

function getIdealDimensions () {
  if (window.matchMedia('(orientation: portrait)').matches) {
    return { height: 1280, width: 720 }
  }
  return { height: 720, width: 1280 }
}

export class QRCodeReader extends Component {
  constructor () {
    super()

    const { height, width } = getIdealDimensions()

    this.state = {
      canvas: null,
      data: null,
      dataUrl: null,
      error: null,
      height,
      qr: null,
      streamUrl: null,
      timer: null,
      video: null,
      width
    }

    this.onRefCanvas = this.onRefCanvas.bind(this)
    this.onRefVideo = this.onRefVideo.bind(this)
  }

  componentDidMount () {
    const qr = new QrCode()
    qr.callback = this.onQrDecode.bind(this)
    this.setState({ qr })

    const { height, width } = this.state

    Promise.resolve()
      .then(() => navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' }, // 'user'
          height: { ideal: height },
          width: { ideal: width }
        }
      }))
      .then((mediaStream) => {
        this.setState({
          streamUrl: window.URL.createObjectURL(mediaStream)
        })
      })
      .catch((err) => {
        console.log(err)
        this.setState({
          error: err,
          streamUrl: null
        })
      })

    this.setState({
      timer: setTimeout(() => {
        this.doScan()
      }, 500)
    })
  }

  componentWillUnmount () {
    clearTimeout(this.state.timer)
    this.state.qr.callback = null
    this.setState({
      canvas: null,
      data: null,
      dataUrl: null,
      error: null,
      qr: null,
      streamUrl: null,
      timer: null,
      video: null
    })
  }

  doScan () {
    const { canvas, height, video, qr, width } = this.state
    if (!canvas || !video || !video.src || !qr || !qr.callback) {
      return
    }
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, width, height)
    const dataUrl = ctx.getImageData(0, 0, width, height)
    this.setState({ dataUrl })
    qr.decode(dataUrl)

    this.setState({
      timer: setTimeout(() => {
        this.doScan()
      }, 500)
    })
  }

  // called only for successful decoding of data
  onQrData () {
    if (typeof this.props.onQrData === 'function') {
      const { data, dataUrl } = this.state
      this.props.onQrData(data, dataUrl)
    }
  }

  // called after each scan attempt, for both success and failure
  onQrDecode (result) {
    if (typeof result === 'string') {
      console.log('onQrDecode', result)
      if (result.indexOf('error decoding QR Code:') === -1) {
        this.setState({ data: result })
        this.onQrData()
      }
    }
  }

  onRefCanvas (node) {
    this.setState({ canvas: node })
  }

  onRefVideo (node) {
    this.setState({ video: node })
  }

  render () {
    const { data, error, height, streamUrl, width } = this.state
    return (
      <div className={classes.self}>
        <h4>QR Code</h4>
        <p>error: {error && error.message || 'none'}</p>
        <canvas ref={this.onRefCanvas} className={classes.canvas} hidden height={height} width={width} />
        <video ref={this.onRefVideo} className={classes.preview} autoPlay controls={false} src={streamUrl} />
        <p>data: {data || 'none'}</p>
      </div>
    )
  }
}

QRCodeReader.propTypes = {
  onQrData: PropTypes.func
}

export default QRCodeReader
