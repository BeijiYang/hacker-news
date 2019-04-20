import React, { Component } from 'react'
import axios from 'axios'
import GridContainer from './GridContainer'
import Fetch from '../utils/Fetch'
import BigLoading from '../components/layout/BigLoading'
import { debounce } from '../utils/debounce'
import {
  GRID_HEIGHT,
  GRIDS_NUM_PER_ROW,
  PRE_VIEW_NUM,
  ADVANCE_ROW_NUM,
  ADVANCE_FETCH_TIME
} from '../constants/constants'
import '../styles/content.css'

const fetcher = new Fetch()

class Content extends Component {
  constructor(props) {
    super(props)
    this.state = {
      storyIds: [],
      loadCount: 0,
      idsToShow: [],
      gridsNumPerLoad: 0,
      gridsInfo: {},
      isLoading: true
    }
    this.lastScrollTop = 0
    this.timer = null
    this.debouncedHandleScroll = debounce(this.handleScroll, 100)
    this.debouncedFetchIdsOnScreen = debounce(this.fetchIdsOnScreen, 400)
  }

  async componentDidMount() {
    const storyIds = await fetcher.fetchTopStories()

    const gridsNumPerLoad = this.getGridsNumPerScreen()
    const idsToShowOnfirstPage = storyIds && storyIds.slice(0, gridsNumPerLoad + ADVANCE_ROW_NUM)
    // fast API for first page
    const gridsInfo = await fetcher.fetchFirstPage(idsToShowOnfirstPage)

    this.setState({
      storyIds,
      idsToShow: idsToShowOnfirstPage,
      gridsNumPerLoad,
      loadCount: 1,
      gridsInfo,
      isLoading: false,
    })

    window.addEventListener('scroll', this.debouncedHandleScroll, true)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.debouncedHandleScroll, true)
  }

  getGridsNumPerScreen = () => {
    const viewHeight = window.innerHeight
    const headerHeight = this.content && this.content.offsetTop
    const contentVisibleHeight = viewHeight - headerHeight
    const gridRowsPerScreen = Math.ceil(contentVisibleHeight / GRID_HEIGHT)
    const gridNum = gridRowsPerScreen * GRIDS_NUM_PER_ROW

    return gridNum
  }

  handleScroll = (e) => {
    const { target: { scrollHeight, scrollTop, clientHeight } } = e
    if (scrollTop === undefined) return
    const almostReachBottom = (scrollHeight - scrollTop - clientHeight) <= (2 * GRID_HEIGHT)
    // load more grids when reach the bottom
    if (almostReachBottom) {
      this.loadMoreGridContainers()
    }
    // get visible ids and fetch them
    this.debouncedFetchIdsOnScreen(scrollTop)

    this.fetchInAdvanceIfUserStay(scrollTop)
  }

  // TODO: fetch next page in advance if the user stays
  fetchInAdvanceIfUserStay = (scrollTop) => {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      if (this.lastScrollTop === scrollTop) {
        // const idsOnNextPage = this.getIdsOnNextPage(scrollTop)
        // const newGridsInfo = fetcher.fetchNextPage()
        // this.setState({ gridsInfo: { ...newGridsInfo, ...this.state.gridsInfo } })
      }
    }, ADVANCE_FETCH_TIME);
    this.lastScrollTop = scrollTop
  }

  loadMoreGridContainers = () => {
    let { storyIds, idsToShow, loadCount, gridsNumPerLoad } = this.state
    loadCount += 1
    idsToShow = storyIds && storyIds.slice(0, loadCount * gridsNumPerLoad)

    this.setState({
      idsToShow,
      loadCount
    })
  }

  // get visible IDS and fetch their data
  fetchIdsOnScreen = async (scrollTop) => {
    let idsOnScreen = this.getIdsOnScreen(scrollTop)

    let newGridsInfo = await fetcher.fetchGridOnScreenInfo(idsOnScreen, this.state.gridsInfo)

    this.setState({ gridsInfo: { ...newGridsInfo, ...this.state.gridsInfo } })
  }

  // get visible IDS
  getIdsOnScreen = (scrollTop) => {
    const { getPastedGrids, getGridsOnScreenIdRange, state: { storyIds } } = this
    const pastedGrids = getPastedGrids(scrollTop)
    const [firstGridOnScreenIndex, lastGridOnScreenIndex] = getGridsOnScreenIdRange(pastedGrids)

    const idsOnScreen = storyIds.filter((item, index) => {
      return (firstGridOnScreenIndex <= index) && (index <= lastGridOnScreenIndex)
    })
    return idsOnScreen
  }

  getPastedGrids = (scrollTop) => {
    if (!scrollTop) return 0
    const pastedRows = Math.floor(scrollTop / GRID_HEIGHT)
    const pastedGridsNum = pastedRows * GRIDS_NUM_PER_ROW
    return pastedGridsNum // already invisible
  }

  // index range of visible ids, from scrollTop to contentVisibleHeight(bottom)
  getGridsOnScreenIdRange = (pastedGrids) => {
    const { getGridsNumPerScreen, setAdvanceRows, state: { storyIds } } = this
    const firstGridOnScreenIndex = pastedGrids
    const gridsNumPerScreen = getGridsNumPerScreen()
    const lastGridOnScreenIndex = firstGridOnScreenIndex + gridsNumPerScreen - 1 + GRIDS_NUM_PER_ROW

    const maxIndex = storyIds.length
    const advancedFirstIndex = setAdvanceRows(firstGridOnScreenIndex, ADVANCE_ROW_NUM, -1)
    const advancedLastIndex = setAdvanceRows(lastGridOnScreenIndex, ADVANCE_ROW_NUM, 1, maxIndex)

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

  // getIdsOnNextPage = (scrollTop) => {
  //   const idsOnScreen = this.getIdsOnScreen(scrollTop)
  //   const storyIds = this.state.storyIds
  //   const lastId = idsOnScreen[idsOnScreen.length - 1]
  //   const lastIndex = storyIds.indexOf(lastId)
  //   const nextPageIndex = lastIndex + 1
  //   const nextPageIds = storyIds.concat().splice(nextPageIndex, this.state.gridsNumPerLoad)
  //   return nextPageIds
  // }

  render() {
    const { state: { idsToShow, storyIds, gridsInfo } } = this

    const grids = idsToShow && idsToShow.map((id) => {
      return (<GridContainer
        {...gridsInfo[id]}
        key={id}
      />)
    })
    return (
      <div className="content" ref={content => { this.content = content }}>
        {this.state.isLoading
          ? <BigLoading />
          : grids}
      </div>
    )
  }
}

export default Content