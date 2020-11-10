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
  const YT_LIVE_CHAT_ROOT_QSS = '#chat';
  const YT_DATE_IS_STREAM_WORDS = 'stream';

  const YCT_MODAL_ROOT_ID = '#yt-chat-tools';

  let styles = document.createElement('style');
  styles.innerHTML = `
    
#yt-chat-tools {
  color: #EFEFEF;
  font-family: Roboto, Calibri, serif;
  margin-top: 56px;

  height: 600px;
  display: flex;
}

.section-title {
  float: right;
  font-weight: bold;
  color: #606060;
}

.hidden {
  display: none;
}

/* == Section: All chat */
#all-chat {
  font-size: 14px;
  height: 100%;
  width: 50%;
  border-right: 1px solid #303030;
  padding: 5px;

  order: 1;
}

.yct-ac-line * {
  display: inline-block;
  padding-right: 4px;
}
.yct-ac-img {
  width: 12px;
  height: 12px;
}
.yct-ac-time {
  color: #9f9f9f;
  font-size: 12px;
}
.yct-ac-name {
  color: #CECECE;
  font-size: 13px;
  font-weight: bold;
}
.yct-ac-message {
  display: inline;
}


/* == Section: Top players */
#top-players {
  padding: 5px;
  order: 2;
}
  `;

  let renderer = document.createElement('html');
  renderer.innerHTML = `
    
<div id="yt-chat-tools">
  <div id="all-chat">
    <div class="section-title">All Chat</div>
    <div class="yct-ac-line hidden">
      <img class="yct-ac-img" src="https://yt3.ggpht.com/-j1XD5C7ySfw/AAAAAAAAAAI/AAAAAAAAAAA/c1jvcH95CdI/s32-c-k-c0x00ffffff-no-rj-mo/photo.jpg" />
      <div class="yct-ac-time">10:31 AM</div>
      <div class="yct-ac-name">Example</div>
      <div class="yct-ac-message">This looks so messy</div>
    </div>
  </div>

  <div id="top-players">
    asdf
  </div>
</div>
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

    let liveChatRoot = document.querySelector(YT_LIVE_CHAT_ROOT_QSS);
    if (!liveChatRoot) {
      console.log('Waiting for live chat....');
      setTimeout(waitForLiveChatStatus, TIME_BETWEEN_RETRIES_MS);
      return;
    }

    startup();
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
  

// Magic method called by startup-template.js
window.onyctstartup = function(yctRoot) {

}
})();
