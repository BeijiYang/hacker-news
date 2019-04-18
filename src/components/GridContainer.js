import React, { Component } from 'react'
import Grid from './Grid'

class GridContainer extends Component {
  constructor(props) {
    super(props)
  }

  toggleExpand = (e) => {
    this.grid.classList.toggle('expand')
  }

  handleClickUrl = (e) => {
    e.stopPropagation();
  }

  render() {
    const { toggleExpand, handleClickUrl } = this
    return (
      <div className="grid" ref={(grid) => this.grid = grid}>
        <Grid
          handleClick={toggleExpand}
          handleClickUrl={handleClickUrl}
          {...this.props}
        />
      </div>
    )
  }
}

export default GridContainer