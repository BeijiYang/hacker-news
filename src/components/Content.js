import React, { Component } from 'react'
import GridContainer from './GridContainer'
import axios from 'axios'
import { debounce } from '../utils/debounce'
import '../styles/content.css'


const storiesUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json'
const GRID_HEIGHT = 120
const GRIDS_NUM_PER_ROW = 8
const PRE_VIEW_NUM = 500 // text 预览字数

class Content extends Component {
  constructor(props) {
    super(props)
    this.state = {
      storyIds: [],
      loadCount: 0, // 测
      idsToShow: [],
      gridsNumPerLoad: 0,
    }
    this.debouncedHandleScroll = debounce(this.handleScroll, 100)
  }

  async componentDidMount() {
    const storyIds = await this.fetchTopStories()
    const gridsNumPerLoad = this.getGridsNumPerScreen() + 1 // 不加行不行
    const idsToShowOnfirstPage = storyIds.slice(0, gridsNumPerLoad + 2)


    this.setState({
      storyIds,
      idsToShow: idsToShowOnfirstPage,
      gridsNumPerLoad,
    })




    window.addEventListener('scroll', this.debouncedHandleScroll, true)

  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.debouncedHandleScroll, true)
  }

  fetchTopStories() {
    return axios.get(storiesUrl).then(res => res.data)
  }

  // 每屏 格子数量
  getGridsNumPerScreen = () => {
    const viewHeight = window.innerHeight
    const headerHeight = this.content.offsetTop
    const contentVisibleHeight = viewHeight - headerHeight // content 可视区域
    const gridRowsPerScreen = Math.ceil(contentVisibleHeight / GRID_HEIGHT) // 该区域内能放几行
    const gridNum = gridRowsPerScreen * GRIDS_NUM_PER_ROW

    return gridNum
  }

  handleScroll = (e) => {
    const { target: { scrollHeight, scrollTop, clientHeight } } = e
    if (scrollTop === undefined) return
    const almostReachBottom = (scrollHeight - scrollTop - clientHeight) <= (2 * GRID_HEIGHT)
    if (almostReachBottom) {
      this.loadMoreGridContainers()
    }
  }

  loadMoreGridContainers = () => {
    let { storyIds, idsToShow, loadCount, gridsNumPerLoad } = this.state
    loadCount += 1
    idsToShow = storyIds.slice(0, loadCount * gridsNumPerLoad)

    this.setState({
      idsToShow,
      loadCount
    })
  }

  render() {
    const grids = this.state.idsToShow.map((id) => {
      return (<GridContainer
        key={id}
      />)
    })
    return (
      <div className="content" ref={content => { this.content = content }}>
        {grids}
      </div>
    )
  }
}

export default Content