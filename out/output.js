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
    
#yt-chat-tools {
  color: #EFEFEF;
  font-family: Roboto, Calibri, serif;
  margin-top: 56px;

  height: 600px;
  display: flex;
}

.yct-section-title {
  float: right;
  font-weight: bold;
  color: #606060;
}

.hidden {
  display: none;
}

/* == Section: All chat */
#yct-chat {
  font-size: 14px;
  height: 100%;
  width: 50%;
  border-right: 1px solid #303030;
  padding: 5px;
  overflow-y: scroll;

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
  color: #A0A0A0;
  font-size: 13px;
  font-weight: bold;
}
.yct-ac-message {
  display: inline;
}


/* == Section: Top players */
#yct-top-players {
  padding: 5px;
  order: 2;
}
  `;

  let renderer = document.createElement('html');
  renderer.innerHTML = `
    
<div id="yt-chat-tools">
  <div id="yct-chat">
    <div class="yct-section-title">All Chat</div>

    <div id="yct-ac-anchor" class="hidden"></div>
    <div id="yct-ac-template" class="hidden">
      <img class="yct-ac-img"
           src="https://yt3.ggpht.com/-j1XD5C7ySfw/AAAAAAAAAAI/AAAAAAAAAAA/c1jvcH95CdI/s32-c-k-c0x00ffffff-no-rj-mo/photo.jpg"/>
      <div class="yct-ac-time">10:31 AM</div>
      <div class="yct-ac-name">Example</div>
      <div class="yct-ac-message">This looks so messy</div>
    </div>
  </div>

  <div id="yct-top-players">
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

  

const LIVE_CHAT_NODE_NAME = 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER';
const MAX_MESSAGES = 50;

const yct = {
  chatRoot: null,
  chatTemplate: null,
  chatAnchor: null,
};

// Magic method called by startup-template.js
window.onyctstartup = function(yctRoot) {
  yct.chatRoot = document.getElementById('yct-chat');
  yct.chatTemplate = document.getElementById('yct-ac-template');
  yct.chatAnchor = document.getElementById('yct-ac-anchor');

  setUpChatObserver();
}

/** Handles a single new chat message. */
function onChat(chatRoot) {
  let newChat = yct.chatTemplate.cloneNode(/* deep= */ true);
  newChat.id = "";
  newChat.className = "yct-ac-line";

  newChat.children[0].src = chatRoot.querySelector('#img').src;
  newChat.children[1].innerHTML = chatRoot.querySelector('#timestamp').innerText;
  newChat.children[2].innerHTML = chatRoot.querySelector('#author-name').innerText;
  newChat.children[3].innerHTML = chatRoot.querySelector('#message').innerText;

  yct.chatRoot.insertBefore(newChat, yct.chatAnchor);
  if (yct.chatRoot.children.length > MAX_MESSAGES) {
    yct.chatRoot.removeChild(yct.chatRoot.children[0]);
  }
  // Scroll to bottom
  yct.chatRoot.scrollTop = yct.chatRoot.scrollHeight - yct.chatRoot.offsetHeight;
}

/** Instantiates the chat observer to scrape chat messages. */
function setUpChatObserver() {
  let chatRoot =
      document.getElementById('chatframe')
          .contentDocument
          .querySelector('#chat-messages #contents #chat #contents #items');
  if (!chatRoot) {
    console.log('Could not find chat root, stopping');
    return;
  }

  let observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      for(let i = 0; i < mutation.addedNodes.length; i++) {
        if (mutation.addedNodes[i].nodeName !== LIVE_CHAT_NODE_NAME) {
          continue;
        }

        onChat(mutation.addedNodes[i]);
      }
    })
  });
  observer.observe(chatRoot, { childList: true });
}
})();
