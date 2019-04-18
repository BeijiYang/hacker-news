import config from '../config/config'


const storiesUrl = 'https://hacker-news.firebaseio.com/v0/'
const proxyServer = config.proxyServer

export const topStoriesUrl = `${storiesUrl}/topstories.json`
export const getFirstPageInfoFromServer = `${proxyServer}/getFirstPageInfo`
export const getStoryInfoFromServer = `${proxyServer}/getStoryInfo`
export const getfetchPagesInfoFastFromServer = `${proxyServer}/getageInfoFast`