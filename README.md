# HACKER NEWS CLIENT FOR WEB

React + Express

Basically, the front end gets all the ids of top stories from the Hacker News top stories API, then send every id to Hacker News story API to get the data, and show the title, author, scores, URL and preview text on the page.

The problem is, most of the story data object doesn't contain the 'text' key. To show the preview text of every story, we need to generate one. Since the cross-origin restriction, I use the back end server as a proxy to get the HTML from every URL, then find the `<p>` tags, put the string together as a preview text.

Because generating the preview text is very time consuming, I let the back end prepares the data before the front end sending requests.

Front End:
* send a request to Hacker News API, get 500 ids of top stories
* show some of them (according to the size of the screen), load more when almost scroll to the bottom
* calculate to get an array of visible ids
* send ids to back end to get data of every story
* if the user stops longer than 3 seconds, fetch the data of next page in advance

Back End:
* send a request to Hacker News API, get 500 ids of top stories
* get the data of all the stories, most of the data object doesn't contain the 'text' key
* generate the preview text or URL if the data lacking it
* save the data in the fake DB, waiting for a request from the front end
* update the data every hour, usually need to fetch data of 10 new ids every time


# How it works

Front End

* containers:
  * Content: 
    * load some more girds when almost reach the bottom
    * calculating the range of visible Grids and fetch data

  * GridContainer:
    * deal with click to expand the Grid


* components
  * Grid:
    * a presentational functional component
  * Loading components


# How did I boost the performance

* Several different ways to boost the performance:
  * reduce HTTP requests
  * reduce DOM nodes
  * Prevent too much (sync) event/calculating in Javascript
  * prevent unnecessary component rerender

### What did I do

I tried several solutions in demos

#### first version:
  Every Grid gets its own id, calculates its own visibility and URL, and fetch data from Hacker News API.
  Use back end server as a proxy to fetch the HTML of every page, get the `<p>` tags and generate the preview text.

  * problems: 
    * too much scroll event triggered, especially when the gridsList grows.
    * too much HTTP requests
    
  Front End send request to Hacker News API to fetch the data of every grid, then send the `data.url` to Back End to get the HTML.  Then alculate the preview text. 
  Both HTTP request speed and dom manipulating is very slow. The performance is a disaster


#### second version:
Working on reducing the scroll event and HTTP requests
  * Lifting the state up. Let the Content container calculate the range of visible Grids. 
  * Instead of send HTTP request one by one, send an array of visible IDs to Back End. Back End sends requests to Hacker News API and sends back the data. 
  * use event debouncing

 the result:
 
   * the number of triggered scroll event and HTTP requests reduced by an order of magnitude. Awesome! 
   * But the cross-origin-preview-text-generating process is still slow.

#### third version:
Dealing with data fetching speed.
The cross-origin-preview-text-generating process is slow because it contains three phases. 

  * first, generate a URL using id, fetch single story data from Hacker News API,
  * second, send data.url to Bake End to get the HTML string
  * third, get the `<p>` tags and generate the preview text.
  
  I tried to let the Back End do the third step job. Still not fast.

  Why don't let the server fetch all the data and save them in advance? If so, when the Front End sends the request, the Back End will not need to send a request to any API because all the data exist locally.

 result
 
   * The speed becames very fast.
   * the loading time of the first page reduced from 3-4s to less than 1s. Better user experience!
   * need to wait for the server to get ready first.


#### other techniques: 

  * save the response data, check them before fetching data, only send a request when necessary.
  * fetching data is async, it takes time to get the response data from the server after sending the request. Sometimes the scroll speed is slow, the same Grid may send the request again before the data arrives. So I used lock variables. lock the id when the fetch starts, unlock it after resolved or rejected.

  * use shouldComponentUpdate to prevent unnecessary component rerendering.
  * use more const element, state less componet, pass less props
  * use Loading component


# About cross-origin and making preview text

Because the response data of Hacker News API for a story doesn't contain the text, to show the preview text in every grid, I need to solve 2 problems.
* one is cross-origin-resource-sharing, 
* the other is generating the preview text using the HTTP string.


  I use a back end server as a proxy to get the HTML of every story(page), query all the p tag to get the text, then put them together to get a preview text.

  Sometimes the text is not the beginning of the main article, as the big difference between different pages.
  
 This issue caused me an interesting problem once. The loading speed of the front page arisen from less 1s to almost 10s, and I had no idea why this happened because I did nothing and the net worked fine.
  After some investigation, I realized the reason: the program parsed some PDF file as normal HTML string!
  
  If it is a real project, I need to discuss with the back end about this issue. I need a "data.text" from the back end API.






# About the figure picture
 As I can see from the figure, the Grid needs to expand or shrink onClick. Because it expands to two directions, I use the grid layout. The two figures are very simple, without any data or detailed description. What I don't know is what to do when the room is not enough for a Big Grid. Now the grids follow the default rules of grid layout. If it is a real project, I need more detailed information from the designer.



# TODO
* ~~pre-fetching: 
  if the user stops at the same place more then 3s, fetch the next page data in advance.~~ (done)

* DOM recycling

* use MongoDB in the backend

* more unit tests

* other tricks like using fade in translation to make it feels faster.

* Better styling

* trying refactor it using Redux and Immutable

* making it responsible for different screens
