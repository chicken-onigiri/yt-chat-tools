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
    ${1}
  `;

  let renderer = document.createElement('html');
  renderer.innerHTML = `
    ${2}
  `;

  ${3}

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
