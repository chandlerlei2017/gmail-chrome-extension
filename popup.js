var signin = function (callback) {
  chrome.identity.getAuthToken({interactive: true}, callback);
};

function onGoogleLibraryLoaded() {
  signin(authorizationCallback);
}

var authorizationCallback = function (data) {
  gapi.client.setToken({access_token: data});
  gapi.client.load("https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest");
};

