const axios = require('axios')
const jsdom = require("jsdom")
const { JSDOM } = jsdom;

const storiesUrl = 'https://hacker-news.firebaseio.com/v0/'
const askUrl = (id) => (`https://news.ycombinator.com/item?id=${id}`)
const getTopStoriesUrl = () => (`${storiesUrl}/topstories.json`)
const getSingleStoryUrl = (id) => (`${storiesUrl}/item/${id}.json`)

let fakeDB = {}

// generate preview text
const getParagraphText = (htmlString, num = 500) => {
  const dom = new JSDOM(htmlString);
  const paragraphs = dom.window.document.querySelectorAll('p')
  let text = ''
  for (let i = 0; i < paragraphs.length; i++) {
    text += paragraphs[i] && paragraphs[i].textContent.trim()
    if (text.length >= num) break
  }
  return text
}
// get top stories ids
const fetchTopStories = (axios) => (
  axios(getTopStoriesUrl()).then(res => res.data)
)
// get data of single story
const fetchStory = (axios, id) => (
  axios(getSingleStoryUrl(id)).then(res => res.data)
)

const fakeQueryDB = (id) => (fakeDB[id])

const queryAllFromFakeDB = (ids) => {
  const tempData = {}
  ids.forEach(id => {
    tempData[id] = fakeQueryDB(id) || null
  })
  return tempData
}

const getText = (url) => {
  return axios.get(url)
    .then(page => page.data)
    .then(htmlStr => getParagraphText(htmlStr, 500))
    .catch(err => console.log(err))
}

const setDataValue = async (data) => {
  const { id, url, text } = data
  // set url
  if (!url) { data.url = askUrl(id) }
  // set text
  if (!text) {
    if (data.url.substr(-4) === '.pdf') {
      data.text = 'PDF'
    } else {
      data.text = await getText(data.url)
    }
  }
  return data
}

const fetchAll = (ids, res) => {
  // fetch API
  const fetchToShow = ids.map(id => fetchStory(axios, id)) // 分别向API请求数据
  const tempData = {}
  return axios.all(fetchToShow).then(
    async dataArr => {
      for (let i = 0; i < dataArr.length; i++) {
        const data = dataArr[i]
        const id = data.id
        tempData[id] = await setDataValue(data)
      }
      return tempData
    }
  )
}

exports.showFakeDB = (req, res) => {
  res.send(fakeDB)
}

exports.initializeFakeDB = async () => {
  const storyIds = await fetchTopStories(axios)
  // const fristPageData = storyIds.slice(0, 50)
  const idsToFatch = storyIds

  for (let i = 0; i < idsToFatch.length; i++) {
    const id = idsToFatch[i];
    const storyData = await fetchStory(axios, id)
    const completeData = await setDataValue(storyData)

    fakeDB[id] = completeData
    console.log(`fetching data: ${i} done, ${500 - i} to go`)
  }
  console.log('~DATA READY~')
}

// only fetch data from API when necessary
exports.getStoryInfo = async (req, res) => {
  const { body: { idsToShow: idArr } } = req

  const alreadySaved = (id) => (!!fakeQueryDB(id))

  const idsQueryFromDB = idArr.filter(id => alreadySaved(id))
  const dataFromDB = (idsQueryFromDB.length) ? queryAllFromFakeDB(idArr) : {}
  console.log("idsQueryFromDB.length   " + idsQueryFromDB.length)
  console.log(`${idsQueryFromDB.length} ids from local fakeDB`)

  const idsNeedToFetch = idArr.filter(id => !alreadySaved(id))
  const dataFromApi = (idsNeedToFetch.length) ? await fetchAll(idsNeedToFetch) : {}
  console.log("idsNeedToFetch.length   " + idsNeedToFetch.length)
  console.log(`${idsNeedToFetch.length} ids to fetch from API`)

  const dataToSend = { ...dataFromDB, ...dataFromApi }
  res.send(dataToSend)

  fakeDB = { ...fakeDB, ...dataToSend } // update fakeDB
}
