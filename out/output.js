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

  let styles = document.createElement('style');
  styles.innerHTML = `
    
body {
  background-color: #121212;
}
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
}  `;

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

  

// Magic method called by startup-template.js
function onstartup(root) {
  console.log(root);
  console.log("startup ran");
}

  function waitForStartup() {
    let title = document.querySelector('#info .style-scope.yt-formatted-string');
    if (title == null) {
      console.log("Waiting for title...");
      setTimeout(waitForStartup, 500);
      return;
    }

    document.head.append(styles);
    let ytContentRoot = document.getElementById('content');
    if (ytContentRoot == null) {
      console.log("Couldn't find YT content root, shutting down");
      return;
    }
    let chatToolsRoot = renderer.querySelector('#yt-chat-tools');
    ytContentRoot.prepend(chatToolsRoot);

    onstartup(chatToolsRoot);
  }

  waitForStartup();
})();
