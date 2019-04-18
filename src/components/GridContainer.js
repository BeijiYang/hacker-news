import React, { Component } from 'react'
import Grid from './Grid'

class GridContainer extends Component {
  constructor(props) {
    super(props)
  }

  toggleExpand = (e) => {
    this.grid.classList.toggle('expand')
  }
  test = () => {
    console.log('sssss')
  }

  render() {
    const { toggleExpand } = this
    return (
      <div className="grid" ref={(grid) => this.grid = grid}>
        <Grid
          handleClick={toggleExpand}
          {...this.props}
        />
      </div>
    )
  }
}

export default GridContainer