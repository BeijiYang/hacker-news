import React, { Component } from 'react'
import GridContainer from './GridContainer'
import Fetch from '../utils/Fetch'
import BigLoading from '../components/layout/BigLoading'
import { debounce } from '../utils/debounce'
import {
  GRID_HEIGHT,
  GRIDS_NUM_PER_ROW,
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
    this.debouncedHandleScroll = debounce(this.handleScroll, 400)
    this.debouncedFetchIdsOnScreen = debounce(this.fetchIdsOnScreen, 400)
    this.debouncedFetchNextPageIfUserStay = debounce(this.fetchNextPageIfUserStay, ADVANCE_FETCH_TIME)
  }

  async componentDidMount() {
    const storyIds = await fetcher.fetchTopStories()

    const gridsNumPerLoad = this.getGridsNumPerScreen()
    const idsToShowOnfirstPage = storyIds && storyIds.slice(0, gridsNumPerLoad + ADVANCE_ROW_NUM)
    // fast API for first page
    const gridsInfo = await fetcher.fetchIds(idsToShowOnfirstPage, {})

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

  /**
   * @param ids {Array} an array of ids to fetch
   */
  fetchIds = async (ids) => {
    if (!Array.isArray(ids)) throw new TypeError(`${ids} should be an array`)
    const newGridsInfo = await fetcher.fetchIds(ids, this.state.gridsInfo)
    if (!newGridsInfo) return
    this.setState({ gridsInfo: { ...this.state.gridsInfo, ...newGridsInfo } })
  }

  getGridsNumPerScreen = () => {
    const viewHeight = window.innerHeight
    const headerHeight = this.content && this.content.offsetTop
    const contentVisibleHeight = viewHeight - headerHeight
    const gridRowsPerScreen = Math.ceil(contentVisibleHeight / GRID_HEIGHT)
    const gridNum = gridRowsPerScreen * GRIDS_NUM_PER_ROW

    return gridNum
  }

  // get visible IDS
  getIdsOnScreen = (scrollTop) => {
    if (typeof scrollTop !== 'number' || isNaN(scrollTop)) throw new TypeError(`${scrollTop} should be a number`)
    const { getPastedGridsNum, getGridsOnScreenIdRange, state: { storyIds } } = this
    const pastedGridsNum = getPastedGridsNum(scrollTop)
    const [firstGridOnScreenIndex, lastGridOnScreenIndex] = getGridsOnScreenIdRange(pastedGridsNum)

    const idsOnScreen = storyIds.filter((item, index) => {
      return (firstGridOnScreenIndex <= index) && (index <= lastGridOnScreenIndex)
    })
    return idsOnScreen
  }

  getPastedGridsNum = (scrollTop) => {
    if (typeof scrollTop !== 'number' || isNaN(scrollTop)) throw new TypeError(`${scrollTop} should be a number`)
    if (!scrollTop) return 0
    const pastedRows = Math.floor(scrollTop / GRID_HEIGHT)
    const pastedGridsNum = pastedRows * GRIDS_NUM_PER_ROW
    return pastedGridsNum // already invisible
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

    const scrollDown = this.lastScrollTop < scrollTop
    if (scrollDown) {
      this.debouncedFetchNextPageIfUserStay(scrollTop)
    }
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
    if (typeof scrollTop !== 'number' || isNaN(scrollTop)) throw new TypeError(`${scrollTop} should be a number`)
    const { getIdsOnScreen, fetchIds } = this
    const idsOnScreen = getIdsOnScreen(scrollTop)
    fetchIds(idsOnScreen)
  }

  // fetch the next page in advance if the user stays
  fetchNextPageIfUserStay = (scrollTop) => {
    if (typeof scrollTop !== 'number' || isNaN(scrollTop)) throw new TypeError(`${scrollTop} should be a number`)
    let { getIdsOnNextPage, fetchIds } = this
    const idsOnNextPage = getIdsOnNextPage(scrollTop)
    const reachTheLastPage = idsOnNextPage.length === 0
    if (reachTheLastPage) return
    fetchIds(idsOnNextPage)
    this.lastScrollTop = scrollTop
  }

  getIdsOnNextPage = (scrollTop) => {
    if (typeof scrollTop !== 'number' || isNaN(scrollTop)) throw new TypeError(`${scrollTop} should be a number`)
    const { getIdsOnScreen, state: { storyIds, gridsNumPerLoad } } = this
    const idsOnScreen = getIdsOnScreen(scrollTop)
    const lastId = idsOnScreen[idsOnScreen.length - 1]
    const lastIndex = storyIds.indexOf(lastId)
    const nextPageIndex = lastIndex + 1
    const nextPageIds = storyIds.concat().splice(nextPageIndex, gridsNumPerLoad)
    return nextPageIds
  }

  // index range of visible ids, from scrollTop to contentVisibleHeight(bottom)
  getGridsOnScreenIdRange = (pastedGridsNum) => {
    if (typeof pastedGridsNum !== 'number' || isNaN(pastedGridsNum)) throw new TypeError(`${pastedGridsNum} should be a number`)
    const { getGridsNumPerScreen, setAdvanceRows, state: { storyIds } } = this
    const firstGridOnScreenIndex = pastedGridsNum
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
   * @param maxIndex {Number} max boundary value
   */
  setAdvanceRows = (index, advanceRowNum, direction, maxIndex) => {
    if (direction !== 1 && direction !== -1) throw new TypeError(`${direction} should be 1 or -1`)
    let advancedIndex = index + direction * advanceRowNum * GRIDS_NUM_PER_ROW
    if (advancedIndex < 0) advancedIndex = 0
    if (advancedIndex > maxIndex) advancedIndex = maxIndex
    return advancedIndex
  }

  render() {
    const { state: { idsToShow, gridsInfo } } = this

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