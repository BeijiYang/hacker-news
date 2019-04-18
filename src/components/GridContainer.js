import React, { Component } from 'react'
import Grid from './Grid'

class GridContainer extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    return (
      (this.props.title !== nextProps.title)
      || (this.props.text !== nextProps.text)
      || (this.props.url !== nextProps.url)
      || (this.props.score !== nextProps.score)
      || (this.props.by !== nextProps.by)
    )
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