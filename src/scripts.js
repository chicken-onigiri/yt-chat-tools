
const LIVE_CHAT_NODE_NAME = 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER';
const MAX_MESSAGES = 50;
const REFLOW_TOP_EVERY = 10;

const WEIGHTED_WORDS = {
  "english": 5,
  "alcohol": 5,
  "a1coho1": 10,
  "you should": 5,
  "block all": 10,
  "gensh1n": 10,
  "not as interesting": 10,
  "alcoho": 10,
};

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
    for (let [word, score] of Object.entries(WEIGHTED_WORDS)) {
      if (message.includes(word)) {
        this.score = this.score + score;
      }
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
