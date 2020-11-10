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
  font-size: 14px;
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

.yct-ac-line {
  cursor: pointer;
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
  width: 50%;
  font-size: 12px;
  overflow-y: scroll;
}

.yct-tp-name {
  display: inline-block;
  width: 200px;
}
.yct-tp-score {
  display: inline-block;
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
    <div class="yct-section-title">Top Suspects</div>
    <div>Tracking <span id="yct-tp-users">0</span> users; <span id="yct-tp-messages">0</span> messages</div>
    <div id="yct-tp-container"></div>
    <div id="yct-tp-template" class="hidden">
      <div class="yct-tp-name">Example</div>
      <div class="yct-tp-score">0 Points</div>
    </div>
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
const REFLOW_TOP_EVERY = 10;

const yct = {
  chatRoot: null,
  chatTemplate: null,
  chatAnchor: null,

  topTemplate: null,
  topContainer: null,
  topTrackerUsers: null,
  topTrackerMessages: null,

  pauseChat: false,
  pauseChatBuffer: [],
};
const chat = {
  reflowUpdateCount: 0,

  // Object<String, UserChat>
  users: {},
};
class UserChat {
  constructor(name) {
    this.score = 0;
    this.messages = {};
    this.messageCount = 0;

    this.element = yct.topTemplate.cloneNode(/* deep= */ true);
    this.element.id = "";
    this.element.className = "yct-tp-line";

    this.element.children[0].innerHTML = name;
    this.elementScore = this.element.children[1];
  }

  addMessage(message) {
    message = message.toLowerCase();
    this.score++;
    this.messageCount++;
    if (!!this.messages[message]) {
      this.score = this.score + 20;
    }
    this.messages[message] = 1;
    this.elementScore.innerHTML = this.score;
  }
}

// Magic method called by startup-template.js
window.onyctstartup = function(yctRoot) {
  yct.chatRoot = document.getElementById('yct-chat');
  yct.chatTemplate = document.getElementById('yct-ac-template');
  yct.chatAnchor = document.getElementById('yct-ac-anchor');

  yct.topTemplate = document.getElementById('yct-tp-template');
  yct.topContainer = document.getElementById('yct-tp-container');
  yct.topTrackerUsers = document.getElementById('yct-tp-users');
  yct.topTrackerMessages = document.getElementById('yct-tp-messages');

  setUpChatObserver();

  yct.chatRoot.onmouseenter = function() {
    yct.pauseChat = true;
  };
  yct.chatRoot.onmouseleave = function(e) {
    yct.pauseChat = false;
    yct.pauseChatBuffer.forEach(function(item) {
      onChat(item);
    });
    yct.pauseChatBuffer = [];
  };
}

/** Handles a single new chat message. */
function onChat(chatRoot) {
  let newChat = yct.chatTemplate.cloneNode(/* deep= */ true);
  newChat.id = "";
  newChat.className = "yct-ac-line";

  let authorName = chatRoot.querySelector('#author-name').innerText;
  let message = chatRoot.querySelector('#message').innerText;

  newChat.children[0].src = chatRoot.querySelector('#img').src;
  newChat.children[1].innerHTML = chatRoot.querySelector('#timestamp').innerText;
  newChat.children[2].innerHTML = authorName;
  newChat.children[3].innerHTML = message;
  newChat.onclick = function() {
    newChat.style.textDecoration = "line-through";
  };

  yct.chatRoot.insertBefore(newChat, yct.chatAnchor);
  if (yct.chatRoot.children.length > MAX_MESSAGES) {
    yct.chatRoot.removeChild(yct.chatRoot.children[0]);
  }
  // Scroll to bottom
  yct.chatRoot.scrollTop = yct.chatRoot.scrollHeight - yct.chatRoot.offsetHeight;

  if (!chat.users[authorName]) {
    chat.users[authorName] = new UserChat(authorName);
  }
  chat.users[authorName].addMessage(message);

  chat.reflowUpdateCount++;
  if (chat.reflowUpdateCount % REFLOW_TOP_EVERY === 0) {
    let sortableUsers = [];
    let messages = 0;
    let users = 0;
    for (let [name, user] of Object.entries(chat.users)) {
      messages += user.messageCount;
      users++;
      sortableUsers.push([user.score, user])
    }
    let fullHtml = "";
    sortableUsers.sort((a, b) => b[0] - a[0])
    sortableUsers.forEach(pair => fullHtml += pair[1].element.outerHTML);

    yct.topContainer.innerHTML = fullHtml;
    yct.topTrackerMessages.innerHTML = messages;
    yct.topTrackerUsers.innerHTML = users;
  }
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

        if (yct.pauseChat) {
          yct.pauseChatBuffer.push(mutation.addedNodes[i]);
        } else {
          onChat(mutation.addedNodes[i]);
        }
      }
    })
  });
  observer.observe(chatRoot, { childList: true });
}
})();
