let questionsUrl = null;

const getYoutubeVideoId = url => {
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : false;
}

// this runs every time there is an update in the browser
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

    // do a http get request to check if there is a querstions url for the video
    let isQuestionUrl = false;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `https://tubetest.herokuapp.com/api/v1/youtube/${vidId}`, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        isQuestionUrl = JSON.parse(xhr.responseText);

        if (isQuestionUrl) {
          questionsUrl = `https://tubetest-react.herokuapp.com/questions/${vidId}`;
        }
        else questionsUrl = null;

        // do get request to see if there are questions for that video
        if (isQuestionUrl === true) {
          chrome.browserAction.setIcon({ path: 'images/green.png' });
        }

      }
    }
    xhr.send();
  }
});

chrome.browserAction.onClicked.addListener(tab => {
  if (questionsUrl !== null) {
    // open the url in a new tab
    chrome.tabs.create({ url: `${questionsUrl}` });
  }
  else if (tab.url.includes("youtube.com") && getYoutubeVideoId(tab.url) !== false) {
    // send user to create a question link
    let vidId = getYoutubeVideoId(tab.url);
    chrome.tabs.create({
      url: `https://tubetest-react.herokuapp.com/question/${vidId}`
    });
  }
});