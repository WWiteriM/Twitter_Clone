// eslint-disable-next-line no-undef
$('#postTextarea').keyup((event) => {
  // eslint-disable-next-line no-undef
  const textBox = $(event.target);
  const value = textBox.val().trim();

  // eslint-disable-next-line no-undef
  const submitButton = $('#submitPostButton');

  if (!value) {
    return submitButton.prop('disabled', true);
  }

  return submitButton.prop('disabled', false);
});

// eslint-disable-next-line no-undef
$('#submitPostButton').click((event) => {
  // eslint-disable-next-line no-undef
  const button = $(event.target);
  // eslint-disable-next-line no-undef
  const textBox = $('#postTextarea');

  const data = {
    content: textBox.val(),
  };

  // eslint-disable-next-line no-undef
  $.post('api/posts', data, (postData) => {
    const html = createPostHtml(postData);
    // eslint-disable-next-line no-undef
    $('.postsContainer').prepend(html);
    textBox.val('');
    button.prop('disabled', true);
  });
});

// eslint-disable-next-line no-undef
$(document).on('click', '.likeButton', (event) => {
  // eslint-disable-next-line no-undef
  const button = $(event.target);
  const postId = getPostIdFromElement(button);

  if (!postId) return;

  // eslint-disable-next-line no-undef
  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: 'PUT',
    success: (postData) => {
      button.find('span').text(postData.likes.length || '');

      // eslint-disable-next-line no-underscore-dangle,no-undef
      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass('active');
      } else {
        button.removeClass('active');
      }
    },
  });
});

function getPostIdFromElement(element) {
  const isRoot = element.hasClass('post');
  const rootElement = isRoot ? element : element.closest('.post');
  const postId = rootElement.data().id;

  if (!postId) {
    return alert('Undef');
  }
  return postId;
}

function createPostHtml(postData) {
  const { postedBy } = postData;

  const displayName = `${postedBy.firstName} ${postedBy.lastName}`;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  // eslint-disable-next-line no-undef,no-underscore-dangle
  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? 'active' : '';

  // eslint-disable-next-line no-underscore-dangle
  return `<div class='post' data-id='${postData._id}'>
            <div class='mainContentContainer'>
                <div class='userImageContainer'>
                    <img src='${postedBy.profilePic}'>
                </div>
                <div class='postContentContainer'>
                    <div class='header'>
                        <a href='/profile/${
                          postedBy.username
                        }' class='displayName'>${displayName}</a>
                        <span class='username'>@${postedBy.username}</span>
                        <span class='date'>${timestamp}</span>
                    </div>
                    <div class='postBody'>
                        <span>${postData.content}</span>
                    </div>
                    <div class='postFooter'>
                        <div class='postButtonContainer'>
                            <button>
                                <i class='far fa-comment'></i>
                            </button>
                        </div>
                        <div class='postButtonContainer green'>
                            <button class='retweet'>
                                <i class='fas fa-retweet'></i>
                            </button>
                        </div>
                        <div class='postButtonContainer red'>
                            <button class='likeButton ${likeButtonActiveClass}'>
                                <i class='far fa-heart'></i>
                                <span>${postData.likes.length || ''}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>`;
}

function timeDifference(current, previous) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return 'Just now';

    return `${Math.round(elapsed / 1000)} seconds ago`;
  }

  if (elapsed < msPerHour) {
    return `${Math.round(elapsed / msPerMinute)} minutes ago`;
  }

  if (elapsed < msPerDay) {
    return `${Math.round(elapsed / msPerHour)} hours ago`;
  }

  if (elapsed < msPerMonth) {
    return `${Math.round(elapsed / msPerDay)} days ago`;
  }

  if (elapsed < msPerYear) {
    return `${Math.round(elapsed / msPerMonth)} months ago`;
  }

  return `${Math.round(elapsed / msPerYear)} years ago`;
}
