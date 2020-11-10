// ==UserScript==
// @name         YT Chat Tools
// @namespace    http://youtube.com
// @version      0.1
// @description  YT Chat tools
// @author       You
// @match        https://www.youtube.com/watch*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const MAX_STARTUP_ATTEMPTS = 30;
  const TIME_BETWEEN_RETRIES_MS = 500;

  const YT_CONTENT_ROOT_ID = 'content';
  const YT_VIDEO_DATE_ID = 'date';
  const YT_LIVE_CHAT_IFRAME = 'chatframe';
  const YT_DATE_IS_STREAM_WORDS = 'stream';

  const YCT_MODAL_ROOT_ID = '#yt-chat-tools';

  let styles = document.createElement('style');
  styles.innerHTML = `
    ${1}
  `;

  let renderer = document.createElement('html');
  renderer.innerHTML = `
    ${2}
  `;

  window.onyctstartup = function() {};

  // Sequential startup
  // As YouTube loads asynchronously, there are multiple stages of startup for YT Chat Tools.
  // 1. Validate the video "date" contains the string "stream"
  // 2. Validate live chat exists and is enabled
  var startupAttempts = 0;
  function waitForVideoStreamStatus() {
    if (++startupAttempts > MAX_STARTUP_ATTEMPTS) {
      console.log(`YCT failed to start after ${MAX_STARTUP_ATTEMPTS} waiting for video stream status, shutting down.`)
      return;
    }
    console.log(`YCT startup attempt ${startupAttempts} / ${MAX_STARTUP_ATTEMPTS}`);

    let date = document.getElementById(YT_VIDEO_DATE_ID);
    if (!date) {
      console.log("Waiting for video date...");
      setTimeout(waitForVideoStreamStatus, TIME_BETWEEN_RETRIES_MS);
      return;
    }
    if (!date.innerText.toLocaleLowerCase().includes(YT_DATE_IS_STREAM_WORDS)) {
      console.log("Video is not a stream, so there's no live chat. shutting down.")
      return;
    }

    startupAttempts = 0;
    waitForLiveChatStatus();
  }

  function waitForLiveChatStatus() {
    if (++startupAttempts > MAX_STARTUP_ATTEMPTS) {
      console.log(`YCT failed to start after ${MAX_STARTUP_ATTEMPTS} waiting for live chat status, shutting down.`)
      return;
    }
    console.log(`YCT startup attempt ${startupAttempts} / ${MAX_STARTUP_ATTEMPTS}`);

    let liveChatRoot = document.getElementById(YT_LIVE_CHAT_IFRAME);
    if (!liveChatRoot) {
      console.log('Waiting for live chat....');
      setTimeout(waitForLiveChatStatus, TIME_BETWEEN_RETRIES_MS);
      return;
    }
    liveChatRoot.onload = startup;
  }

  function startup() {
    let ytContentRoot = document.getElementById(YT_CONTENT_ROOT_ID);
    if (!ytContentRoot) {
      console.log('No YT root - shutting down.');
      return;
    }

    document.head.append(styles);
    let chatToolsRoot = renderer.querySelector(YCT_MODAL_ROOT_ID);
    ytContentRoot.prepend(chatToolsRoot);

    window.onyctstartup(chatToolsRoot);
  }

  waitForVideoStreamStatus();
})();

(function() {
  'use strict';

  ${3}
})();
