$(document).ready(() => {
  $.get('/notifications/show', (data) => {
    $('.loadingSpinnerContainer').remove();
    $('.resultsContainer').css('visibility', 'visible');
    outputNotificationList(data, $('.resultsContainer'));
  });
});

$('#markNotificationAsRead').click(() => {
  markNotificationsAsOpened();
});

function outputNotificationList(notifications, container) {
  notifications.forEach((notification) => {
    const html = createNotificationHtml(notification);
    container.append(html);
  });

  if (!notifications.length) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}

function createNotificationHtml(notification) {
  const { userFrom } = notification;
  const text = getNotificationText(notification);
  const href = getNotificationUrl(notification);
  const className = notification.opened ? '' : 'active';

  return `<a href='${href}' class='resultListItem notification ${className}' data-id='${notification._id}'>
            <div class='resultsImageContainer'>
                <img src='${userFrom.profilePic}'>
            </div>
            <div class='resultsDetailsContainer ellipsis'>
                <span class='ellipsis'>${text}</span>
            </div>
          </a>`;
}

function getNotificationText(notification) {
  const { userFrom } = notification;

  if (!userFrom.firstName || !userFrom.lastName) {
    return alert('User from data not populated');
  }

  const userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
  let text;

  if (notification.notificationType === 'retweet') {
    text = `${userFromName} retweet one of your posts`;
  } else if (notification.notificationType === 'postLike') {
    text = `${userFromName} liked one of your posts`;
  } else if (notification.notificationType === 'reply') {
    text = `${userFromName} replied to one of your posts`;
  } else if (notification.notificationType === 'follow') {
    text = `${userFromName} follow you`;
  }

  return `<span class='ellipsis'>${text}</span>`;
}

function getNotificationUrl(notification) {
  let url = '#';

  if (
    notification.notificationType === 'retweet' ||
    notification.notificationType === 'postLike' ||
    notification.notificationType === 'reply'
  ) {
    url = `/posts/${notification.entityId}`;
  } else if (notification.notificationType === 'follow') {
    url = `/profile/${notification.entityId}`;
  }

  return url;
}
