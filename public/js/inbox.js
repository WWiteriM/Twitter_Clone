$(document).ready(() => {
  $.get('/api/chats', (data, status, xhr) => {
    if (xhr.status === 400) {
      alert('Could not get chat list');
    } else {
      outputChatList(data, $('.resultsContainer'));
    }
  });
});

function outputChatList(chatList, container) {
  chatList.forEach((chat) => {
    const html = createChatHtml(chat);
    container.append(html);
  });

  if (!chatList.length) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}

function createChatHtml(chatData) {
  const chatName = getChatName(chatData);
  const latestMessage = 'message';
  const image = getChatImageElement(chatData);

  return `<a href='/messages/${chatData._id}' class='resultListItem'>
            ${image}
            <div class='resultsDetailsContainer ellipsis'>
                <span class='heading ellipsis'>${chatName}</span>
                <span class='subText ellipsis'>${latestMessage}</span>
            </div>
          </a>`;
}

function getChatName(chatData) {
  let { chatName } = chatData;

  if (!chatName) {
    const otherChatUsers = getOtherChatUsers(chatData.users);
    const nameArray = otherChatUsers.map((user) => `${user.firstName} ${user.lastName}`);
    chatName = nameArray.join(', ');
  }
  return chatName;
}

function getOtherChatUsers(users) {
  if (users.length === 1) return users;

  return users.filter((user) => user._id !== userLoggedIn._id);
}

function getChatImageElement(chatData) {
  const otherChatUsers = getOtherChatUsers(chatData.users);
  let chatImage = getUserChatImageElement(otherChatUsers[0]);
  let groupChatClass = '';

  if (otherChatUsers.length > 1) {
    groupChatClass = 'groupChatImage';
    chatImage += getUserChatImageElement(otherChatUsers[1]);
  }

  return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}

function getUserChatImageElement(user) {
  if (!user || !user.profilePic) {
    return alert('User passed into function is invalid');
  }

  return `<img src="${user.profilePic}" alt="User's profile pic">`;
}
