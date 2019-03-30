function popupClicked() {
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
      'interactive': true
  });
}

function getAuthToken(options) {
  chrome.identity.getAuthToken({ 'interactive': options.interactive }, options.callback);
}

// List Most Recent Messages
function populatePopup() {
  getAuthToken({
      'interactive': false,
      'callback': getMessageList
  });
}

function getMessageList(token){
  get({
      'url': 'https://www.googleapis.com/gmail/v1/users/me/messages?labelIds=CATEGORY_PERSONAL&maxResults=100&q=is%3Aunread',
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
    'url': 'https://www.googleapis.com/gmail/v1/users/me/messages/' + id + '?format=full',
    'callback': message,
    'token': token,
  });
}

function message(message) {
    var blockLeft = $("<div></div>");
    var blockRight = $("<div></div>");

    var divider = $("<div></div>");
    divider.append("<hr/>");

    blockLeft.addClass("col-sm-4");
    blockRight.addClass("col-sm-8");
    divider.addClass("col-sm-12");

    var name = document.createElement("h5");
    name.innerHTML = getElements(message).name;

    var email = document.createElement("p");
    email.innerHTML = getElements(message).email;

    var subject = document.createElement("p");
    subject.innerHTML = getElements(message).subject;

    blockLeft.append(name);
    blockLeft.append(email);
    blockRight.append(subject);

    var element = $("#message-block");
    element.append(blockLeft);
    element.append(blockRight);
    element.append(divider);
}

function getElements(message) {
  senderTemp = message.payload.headers.find(element => element.name === 'From').value;
  name = senderTemp.substring(0, senderTemp.indexOf("<") - 1);
  email = senderTemp.substring(senderTemp.indexOf("<") + 1 , senderTemp.length - 1);

  subject = message.payload.headers.find(element => element.name === 'Subject').value;

  return {name: name, email: email, subject: subject};
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
