let questionsUrl = null;

const getYoutubeVideoId = url => {
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : false;
}

const getQuestionsUrl = async (videoId) => {

  return fetch('http://localhost:3000/api/v1/youtube/' + videoId )
    .then(dataWrappedByPromise => dataWrappedByPromise.json())
    .then(data => {
      if (data !== null) {
        return data.questionsUrl;
      }
      else return null;
    })
    .catch(err => console.log(err));
};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

  if (changeInfo.status === 'loading') {
    // set the icon to red
    chrome.browserAction.setIcon({
      path: 'images/red.png'
    });

    questionsUrl = null;
  }

  if (tab.url.includes("youtube") && changeInfo.status === 'complete') {

    const vidId = getYoutubeVideoId(tab.url);

    let qUrl = await getQuestionsUrl(vidId);
    questionsUrl = qUrl;

    // do get request to see if there are questions for that video
    if (qUrl !== null) {
      chrome.browserAction.setIcon({ path: 'images/green.png' });
    }
  }
});

chrome.browserAction.onClicked.addListener(tab => {
  if (questionsUrl !== null) {
    console.log(questionsUrl);
    // open the url in a new tab
    chrome.tabs.create({ url: `http://${questionsUrl}` });
  }
  else if (tab.url.includes("youtube.com") && getYoutubeVideoId(tab.url) !== false) {
    // send user to create a question link
    let vidId = getYoutubeVideoId(tab.url);
    chrome.tabs.create({ url: `http://localhost:3001/question/${vidId}` });
  }
});