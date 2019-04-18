const axios = require('axios')
const jsdom = require("jsdom")
const { JSDOM } = jsdom;

const storiesUrl = 'https://hacker-news.firebaseio.com/v0/'
const askUrl = (id) => (`https://news.ycombinator.com/item?id=${id}`)
const getTopStoriesUrl = () => (`${storiesUrl}/topstories.json`)
const getSingleStoryUrl = (id) => (`${storiesUrl}/item/${id}.json`)

let fakeDB = {}

// 从 HTML 字符串中找 p 标签取文字
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

const fetchTopStories = (axios) => (
  axios(getTopStoriesUrl()).then(res => res.data)
)

const fetchStory = (axios, id) => (
  axios(getSingleStoryUrl(id)).then(res => res.data) // 每个故事的data
)

const fakeQueryDB = (id) => (fakeDB[id])

exports.showData = (req, res) => {
  res.send(fakeDB)
}

exports.queryFakeDatabase = (req, res) => {
  const { body: { idsToShow: idArr } } = req
  // query local
  const tempData = {}
  idArr.forEach(id => {
    tempData[id] = fakeQueryDB(id) || null
  })
  res.send(tempData)
}


exports.setDataReady = async () => {
  const storyIds = await fetchTopStories(axios)

  // const fristPageData = storyIds.slice(0, 50)

  const idsToFatch = storyIds

  for (let i = 0; i < idsToFatch.length; i++) {
    const id = idsToFatch[i];
    const storyData = await fetchStory(axios, id)

    if (!storyData.url) storyData.url = askUrl(id)
    // if (!storyData.url) storyData.url = `https://news.ycombinator.com/item?id=${id}`
    if (!storyData.text) {
      console.time(id)
      if (storyData.url.substr(-4) === '.pdf') {
        text = 'PDF'
      } else {
        text = await axios.get(storyData.url).then(page => page.data).then(htmlStr => getParagraphText(htmlStr, 500)).catch(err => console.log(err))
      }
      console.timeEnd(id)
      storyData.text = text
    }

    fakeDB[id] = storyData
    console.count('for')
    console.log(`fetch data for first page: ${500 - i} left to go`)
  }
  console.log('~DATA READY~')
}

// todo 先查缓存 没有在fetch data from API
exports.getStoryInfo = (req, res) => {
  const { body: { idsToShow: idArr } } = req
  // // query local
  const tempData = {}

  // TODO 缓存
  // fetch API
  const fetchToShow = idArr.map(id => fetchStory(axios, id)) // 分别向API请求数据

  // const tempData = {}
  axios.all(fetchToShow).then(
    dataArr => {
      dataArr.forEach(
        data => {
          let id = data.id
          if (!data.url) { data.url = `https://news.ycombinator.com/item?id=${id}` }
          if (!data.text) {
            // this.getText(data.url).then(text => data.text = text)
            // 重复
            if (data.url.substr(-4) === '.pdf') {
              console.log('fucking PDF!!!')
              text = 'PDF'
              data.text = text
            } else {
              data.text = 'old version API blablabla'
            }
          }
          // data.text = 'sdfsdfsdfsdf'
          tempData[id] = data
        }
      )
      // fakeDB = { ...tempData, ...fakeDB } // 缓存
      res.send(tempData)
    }
  )
}
