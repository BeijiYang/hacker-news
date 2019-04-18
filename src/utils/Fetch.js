import axios from 'axios'

const storiesUrl = 'https://hacker-news.firebaseio.com/v0/'
const getTopStoriesUrl = () => (`${storiesUrl}/topstories.json`)

const proxyServer = 'http://localhost:3001'
const getFirstPageInfoFromServer = `${proxyServer}/getFirstPageInfo`
const getStoryInfoFromServer = `${proxyServer}/getStoryInfo`

export default class Fetch {
	constructor() {
		this.fetchedGrids = {} // lock
	}

	_fetchStory(idsToFatch) {
		return axios.post(getStoryInfoFromServer, { idsToShow: idsToFatch }).then(res => res.data)
	}
	_unlLock(ids) {
		ids.forEach(id => this.fetchedGrids[id] = false) // todo 锁的条件
	}

	fetchTopStories() {
		return axios(getTopStoriesUrl()).then(res => res.data)
	}

	fetchFirstPage(idsToShowOnfirstPage) {
		return axios.post(getFirstPageInfoFromServer, { idsToShow: idsToShowOnfirstPage }).then(res => res.data)
	}

	async fetchGridOnScreenInfo(idsOnScreen, gridsInfo) {
		// check local data first
		const idsToFatch = idsOnScreen.filter(id => {
			return !(gridsInfo[id] || this.fetchedGrids[id])
		})

		if (idsToFatch.length !== 0) {
			idsToFatch.forEach(id => {
				this.fetchedGrids[id] = true // lock
			})
			const newGridsInfo = await this._fetchStory(idsToFatch)
			this._unlLock(idsToFatch)
			return newGridsInfo
		}
	}
}