function popupClicked(tab) {
  getAuthToken({
      'interactive': false,
      'callback': AuthTokenCallback,
  });
}

function AuthTokenCallback(token) {
  if (chrome.runtime.lastError) {
      getAuthTokenInteractive();
  }
}

function getAuthTokenInteractive() {
  getAuthToken({
      'interactive': true,
      'callback': getAuthTokenInteractiveCallback,
  });
}

function getAuthTokenInteractiveCallback(token) {
  // Catch chrome error if user is not authorized.
  if (chrome.runtime.lastError) {
      showAuthNotification();
  }
}

function getAuthToken(options) {
  chrome.identity.getAuthToken({ 'interactive': options.interactive }, options.callback);
}


// Notifications

function showAuthNotification() {
  var options = {
      'id': 'start-auth',
      'iconUrl': 'img/developers-logo.png',
      'title': 'GDE Sample: Chrome extension Google APIs',
      'message': 'Click here to authorize access to Gmail',
  };
  createBasicNotification(options);
}

function createBasicNotification(options) {
  var notificationOptions = {
      'type': 'basic',
      'iconUrl': options.iconUrl, // Relative to Chrome dir or remote URL must be whitelisted in manifest.
      'title': options.title,
      'message': options.message,
      'isClickable': true,
  };
  chrome.notifications.create(options.id, notificationOptions, function(notificationId) {});
}

// List Most Recent Messages
function populatePopup() {
  getAuthToken({
      'interactive': false,
      'callback': populatePopupCallback
  });
}


function populatePopupCallback(token){
  get({
      'url': 'https://www.googleapis.com/gmail/v1/users/me/messages?labelIds=CATEGORY_PERSONAL&maxResults=5&q=is%3Aunread',
      'callback': messageList,
      'token': token,
  });
}

function messageList(messageList) {
  for (var i = 0; i < messageList.messages.length; i++){
    getMessage(messageList.messages[i]['id']);
  }
}

// Get Each individual message
function getMessage(id) {
    chrome.identity.getAuthToken( {'interactive' : false},
    function (token){
      getMessageCallback(token, id);
    });
}

function getMessageCallback(token, id) {
  get({
    'url': 'https://www.googleapis.com/gmail/v1/users/me/messages/' + id,
    'callback': message,
    'token': token,
  });
}

function message(message) {
    var para = document.createElement("p");
    var node = document.createTextNode(message.id);
    para.appendChild(node);
    var element = document.getElementById("message-block");
    element.appendChild(para);
}

/**
 * Make an authenticated HTTP GET request.
 *
 * @param {object} options
 *   @value {string} url - URL to make the request to. Must be whitelisted in manifest.json
 *   @value {string} token - Google access_token to authenticate request with.
 *   @value {function} callback - Function to receive response.
 */
function get(options) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
          // JSON response assumed. Other APIs may have different responses.
          options.callback(JSON.parse(xhr.responseText));
      } else {
          console.log('get', xhr.readyState, xhr.status, xhr.responseText);
      }
  };
  xhr.open("GET", options.url, true);
  // Set standard Google APIs authentication header.
  xhr.setRequestHeader('Authorization', 'Bearer ' + options.token);
  xhr.send();
}

popupClicked();
populatePopup();
