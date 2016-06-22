import React from 'react'
import DuckImage from '../assets/Duck.jpg'
import classes from './HomeView.scss'

import QRCodeReader from '../../../components/QRCodeReader/QRCodeReader.js'

export const HomeView = () => (
  <div>
    <h4>Welcome!</h4>
    <img
      alt='This is a duck, because Redux!'
      className={classes.duck}
      src={DuckImage} />
    <QRCodeReader />
  </div>
)

export default HomeView
