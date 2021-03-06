const axios = require('axios')
const jsdom = require("jsdom")
const ProgressBar = require('progress')
const { JSDOM } = jsdom
const virtualConsole = new jsdom.VirtualConsole()
virtualConsole.on('error', () => { })

const PRE_VIEW_NUM = 500
const RE_SET_TIME = 1000 * 60 * 60
const storiesUrl = 'https://hacker-news.firebaseio.com/v0/'
const askUrl = (id) => (`https://news.ycombinator.com/item?id=${id}`)
const getTopStoriesUrl = () => (`${storiesUrl}/topstories.json`)
const getSingleStoryUrl = (id) => (`${storiesUrl}/item/${id}.json`)

let fakeDB = {}

// generate preview text
const getParagraphText = (htmlString, num = PRE_VIEW_NUM) => {
  const dom = new JSDOM(htmlString, { virtualConsole });
  const paragraphs = dom.window.document.querySelectorAll('p')
  let text = ''
  for (let i = 0; i < paragraphs.length; i++) {
    const content = paragraphs[i] && paragraphs[i].textContent.trim()
    if (content.length > num) continue
    text += content
    if (text.length >= num) break
  }
  if (!text) text = 'click on the GO to see the article.'
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
    .then(htmlStr => getParagraphText(htmlStr, PRE_VIEW_NUM))
    .catch(err => console.log(err.code))
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
    dataArr => {
      dataArr.forEach(
        async data => {
          const id = data.id
          tempData[id] = await setDataValue(data)
        }
      )
      return tempData
    }
  )
}
// Divide an array into two arrays according to the condition
const partition = (fn) => (arr) => (
  arr.reduce(
    ([pass, fail], cur) => (
      fn(cur) ? [[...pass, cur], fail] : [pass, [...fail, cur]]
    ),
    [[], []]
  )
)
const alreadySaved = (id) => (!!fakeQueryDB(id))
/**
 * @param ids {Array} an array to filter
 */
const filterIds = (ids) => {
  const [idsQueryFromDB, idsNeedToFetch] = partition(alreadySaved)(ids)
  return [idsQueryFromDB, idsNeedToFetch]
}

const addProgressBar = (len) => {
  const bar = new ProgressBar('  initializing [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 50,
    total: len
  })
  return bar
}

// get data of all top stories and save it in fake DB
setFakeDB = async () => {
  const storyIds = await fetchTopStories(axios)
  const [, idsToFatch] = filterIds(storyIds)
  const len = idsToFatch.length
  if (!len) return

  const bar = addProgressBar(len)

  for (let i = 0; i < idsToFatch.length; i++) {
    const id = idsToFatch[i];
    const storyData = await fetchStory(axios, id)
    const completeData = await setDataValue(storyData)

    fakeDB[id] = completeData
    console.log(`  ${i + 1}/${idsToFatch.length}`)
    bar.tick()
  }
  console.log('~DATA READY~')
}

exports.showFakeDB = (req, res) => {
  res.send(fakeDB)
}

exports.getStoryInfo = async (req, res) => {
  const { body: { idsToShow: idArr } } = req
  // only fetch data from API when necessary
  const [idsQueryFromDB, idsNeedToFetch] = filterIds(idArr)
  console.log(`${idsQueryFromDB.length} ids from local fakeDB \n${idsNeedToFetch.length} ids to fetch from API \n`)

  const dataFromDB = (idsQueryFromDB.length) ? queryAllFromFakeDB(idArr) : {}
  const dataFromApi = (idsNeedToFetch.length) ? await fetchAll(idsNeedToFetch) : {}

  const dataToSend = { ...dataFromDB, ...dataFromApi }
  res.send(dataToSend)

  fakeDB = { ...fakeDB, ...dataToSend } // update fakeDB
}

exports.initializeFakeDB = () => {
  setFakeDB()
  setInterval(setFakeDB, RE_SET_TIME) // refetch every hour to add new story data
}