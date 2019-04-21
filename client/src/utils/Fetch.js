import axios from 'axios'
import {
	topStoriesUrl,
	getFirstPageInfoFromServer,
	getStoryInfoFromServer,
} from '../constants/APIs'


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
		return axios.get(topStoriesUrl).then(res => res.data)
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