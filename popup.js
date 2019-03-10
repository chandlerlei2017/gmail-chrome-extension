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

popupClicked();
