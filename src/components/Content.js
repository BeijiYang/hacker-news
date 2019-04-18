import React, { Component } from 'react'
import GridContainer from './GridContainer'
import axios from 'axios'
import { debounce } from '../utils/debounce'
import Fetch from './Fetch'
import '../styles/content.css'


const storiesUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json'
const GRID_HEIGHT = 120
const GRIDS_NUM_PER_ROW = 8
const PRE_VIEW_NUM = 500 // text 预览字数

const fetcher = new Fetch()

class Content extends Component {
  constructor(props) {
    super(props)
    this.state = {
      storyIds: [],
      loadCount: 0, // 测
      idsToShow: [],
      gridsNumPerLoad: 0,
      gridsInfo: {}, // save the
      isLoading: true
    }
    this.debouncedHandleScroll = debounce(this.handleScroll, 100)
    this.debouncedFetchIdsOnScreen = debounce(this.fetchIdsOnScreen, 400)
  }

  async componentDidMount() {
    const storyIds = await fetcher.fetchTopStories()

    const gridsNumPerLoad = this.getGridsNumPerScreen() + 1 // 不加行不行
    const idsToShowOnfirstPage = storyIds.slice(0, gridsNumPerLoad + 2)
    // fast API for first page
    const gridsInfo = await fetcher.fetchFirstPage(idsToShowOnfirstPage)

    this.setState({
      storyIds,
      idsToShow: idsToShowOnfirstPage,
      gridsNumPerLoad,
      loadCount: 1,
      gridsInfo,
      isLoading: false,
      // idsOnScreen: idsToShowOnfirstPage,
    })

    window.addEventListener('scroll', this.debouncedHandleScroll, true)

  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.debouncedHandleScroll, true)
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
    // get visible ids and fetch them
    this.debouncedFetchIdsOnScreen(scrollTop)
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
  // 计算当前屏幕显示的范围，再fetch这部分
  fetchIdsOnScreen = async (scrollTop) => {
    let idsOnScreen = this.getIdsOnScreen(scrollTop)

    let newGridsInfo = await fetcher.fetchGridOnScreenInfo(idsOnScreen, this.state.gridsInfo)

    this.setState({ gridsInfo: { ...newGridsInfo, ...this.state.gridsInfo } })
  }

  // 计算当前屏幕显示的范围
  getIdsOnScreen = (scrollTop) => {
    const pastedGrids = this.getPastedGrids(scrollTop)
    const [firstGridOnScreenIndex, lastGridOnScreenIndex] = this.getGridsOnScreenIdRange(pastedGrids)

    const idsOnScreen = this.state.storyIds.filter((item, index) => { // 直接在500个大数组里计算
      // const idsOnScreen = this.state.idsToShow.filter((item, index) => { // 在现有越来越长的数组上截取计算
      return (firstGridOnScreenIndex <= index) && (index <= lastGridOnScreenIndex)
    })
    return idsOnScreen
  }

  getPastedGrids = (scrollTop) => { // 已经滚过的高度 scrollTop 里的格子数
    if (!scrollTop) return 0
    // console.log(scrollTop)
    const pastedRows = Math.floor(scrollTop / GRID_HEIGHT)
    const pastedGridsNum = pastedRows * GRIDS_NUM_PER_ROW
    return pastedGridsNum // 已经滚过去的 grid, 看不到了
  }

  // 目前屏幕上显示的部分 高度是 从 scrollTop 顶边 到 contentVisibleHeight 底边
  getGridsOnScreenIdRange = (pastedGrids) => {
    const firstGridOnScreenIndex = pastedGrids
    const gridsNumPerScreen = this.getGridsNumPerScreen()
    const lastGridOnScreenIndex = firstGridOnScreenIndex + gridsNumPerScreen - 1 + GRIDS_NUM_PER_ROW //(最后一行，露头就算)

    const maxIndex = this.state.storyIds.length
    const advancedFirstIndex = this.setAdvanceRows(firstGridOnScreenIndex, 2, -1) // todo 提前量行数 2 常数
    const advancedLastIndex = this.setAdvanceRows(lastGridOnScreenIndex, 2, 1, maxIndex)

    return [advancedFirstIndex, advancedLastIndex]
  }
  /**
   * @param index {Number}
   * @param advanceRowNum {Number}
   * @param direction {Number} -1 for top & 1 for bottom
   */
  setAdvanceRows = (index, advanceRowNum, direction, maxIndex) => {
    let advancedIndex = index + direction * advanceRowNum * GRIDS_NUM_PER_ROW
    if (advancedIndex < 0) advancedIndex = 0
    if (advancedIndex > maxIndex) advancedIndex = maxIndex
    return advancedIndex
  }

  render() {
    const { state: { idsToShow, storyIds, gridsInfo } } = this

    const grids = idsToShow.map((id) => {
      return (<GridContainer
        {...gridsInfo[id]}
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