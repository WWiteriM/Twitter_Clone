$(document).ready(() => {
  $.get('/api/chats', (data, status, xhr) => {
    if (xhr.status === 400) {
      alert('Could not get chat list');
    } else {
      $('.loadingSpinnerContainer').remove();
      $('.resultsContainer').css('visibility', 'visible');
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
  const latestMessage = getLatestMessage(chatData.latestMessage[0]);
  const image = getChatImageElement(chatData);

  let activeClass;
  if (
    !chatData.latestMessage[0] ||
    chatData.latestMessage[0].sender.toString() === userLoggedIn._id ||
    chatData.latestMessage[0].readBy.includes(userLoggedIn._id)
  ) {
    activeClass = '';
  } else {
    activeClass = 'active';
  }
  return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
            ${image}
            <div class='resultsDetailsContainer ellipsis'>
                <span class='heading ellipsis'>${chatName}</span>
                <span class='subText ellipsis'>${latestMessage}</span>
            </div>
          </a>`;
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

function getLatestMessage(latestMessage) {
  if (latestMessage) {
    const { sender } = latestMessage;
    return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
  }
  return 'New chat';
}
