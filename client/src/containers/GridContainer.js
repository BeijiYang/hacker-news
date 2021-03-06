import React, { Component } from 'react'
import Grid from '../components/Grid'
import Loading from '../components/layout/Loading'

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
    const { toggleExpand, handleClickUrl, props } = this
    return (
      <div className="grid" ref={(grid) => this.grid = grid}>
        {props.title
          ? <Grid
            handleClick={toggleExpand}
            handleClickUrl={handleClickUrl}
            {...props}
          />
          : <Loading />
        }
      </div>
    )
  }
}

export default GridContainer