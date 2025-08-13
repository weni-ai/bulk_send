// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
export function initFacebookSdk(appId, loginCallback) {
  // wait for facebook sdk to initialize before starting the app
  window.fbAsyncInit = function () {
    // JavaScript SDK configuration and setup
    FB.init({
      appId, // Facebook App ID
      xfbml: true, // parse social plugins on this page
      version: 'v23.0', //Graph API version
    });

    console.log('facebook sdk initialized')

    // Call login code after init
    loginCallback();
  };

  // Search for current loaded SDK and remove it
  (function (d, s, id) {
    const es = d.getElementById(id);
    if (es) es.remove();
    if (typeof FB !== 'undefined') {
      FB = null;
    }
  })(document, 'script', 'facebook-jssdk');

  // Load the JavaScript SDK asynchronously
  (function (d, s, id) {
    const js = d.getElementsByTagName(s)[0]
    const fjs = d.getElementsByTagName(s)[0]
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
  })(document, 'script', 'facebook-jssdk');
}