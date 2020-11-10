
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

  console.log(yct);

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
}

function setUpChatObserver() {
  console.log(yct);
  let chatRoot =
      document.getElementById('chatframe')
          .contentDocument
          .querySelector('#chat-messages #contents #chat #contents #items');
  if (!chatRoot) {
    console.log('Could not find chat root, stopping');
    return;
  }

  let observer = new WebKitMutationObserver(function(mutations) {
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
