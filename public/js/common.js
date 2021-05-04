// eslint-disable-next-line no-undef
$('#postTextarea, #replyTextarea').keyup((event) => {
  // eslint-disable-next-line no-undef
  const textBox = $(event.target);
  const value = textBox.val().trim();

  const isModal = textBox.parents('.modal').length === 1;

  // eslint-disable-next-line no-undef
  const submitButton = isModal ? $('#submitReplyButton') : $('#submitPostButton');

  if (!value) {
    return submitButton.prop('disabled', true);
  }

  return submitButton.prop('disabled', false);
});

// eslint-disable-next-line no-undef,consistent-return
$('#submitPostButton, #submitReplyButton ').click((event) => {
  // eslint-disable-next-line no-undef
  const button = $(event.target);

  const isModal = button.parents('.modal').length === 1;
  // eslint-disable-next-line no-undef
  const textBox = isModal ? $('#replyTextarea') : $('#postTextarea');

  const data = {
    content: textBox.val(),
  };

  if (isModal) {
    const { id } = button.data();
    if (!id) return alert('Button id is null');
    data.replyTo = id;
  }

  // eslint-disable-next-line no-undef
  $.post('api/posts', data, (postData) => {
    if (postData.replyTo) {
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    } else {
      const html = createPostHtml(postData);
      // eslint-disable-next-line no-undef
      $('.postsContainer').prepend(html);
      textBox.val('');
      button.prop('disabled', true);
    }
  });
});

// eslint-disable-next-line no-undef
$('#replyModal')
  .on('show.bs.modal', (event) => {
    // eslint-disable-next-line no-undef
    const button = $(event.relatedTarget);
    const postId = getPostIdFromElement(button);
    // eslint-disable-next-line no-undef
    $('#submitReplyButton').data('id', postId);

    // eslint-disable-next-line no-undef
    $.get(`api/posts/${postId}`, (results) => {
      // eslint-disable-next-line no-undef
      outputPosts(results, $('#originalPostContainer'));
    });
  })
  .on('hidden.bs.modal', () => {
    // eslint-disable-next-line no-undef
    $('#originalPostContainer').html('');
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

// eslint-disable-next-line no-undef
$(document).on('click', '.retweetButton', (event) => {
  // eslint-disable-next-line no-undef
  const button = $(event.target);
  const postId = getPostIdFromElement(button);

  if (!postId) return;

  // eslint-disable-next-line no-undef
  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: 'POST',
    success: (postData) => {
      button.find('span').text(postData.retweetUsers.length || '');

      // eslint-disable-next-line no-underscore-dangle,no-undef
      if (postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass('active');
      } else {
        button.removeClass('active');
      }
    },
  });
});

// eslint-disable-next-line no-undef
$(document).on('click', '.post', (event) => {
  // eslint-disable-next-line no-undef
  const element = $(event.target);
  const postId = getPostIdFromElement(element);

  if (postId && !element.is('button')) {
    window.location.href = `/posts/${postId}`;
  }
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
  const isRetweet = postData.retweetData !== undefined;
  const retweetedBy = isRetweet ? postData.postedBy.username : null;
  const data = isRetweet ? postData.retweetData : postData;

  const { postedBy } = data;

  const displayName = `${postedBy.firstName} ${postedBy.lastName}`;
  const timestamp = timeDifference(new Date(), new Date(data.createdAt));

  // eslint-disable-next-line no-undef,no-underscore-dangle
  const likeButtonActiveClass = data.likes.includes(userLoggedIn._id) ? 'active' : '';
  // eslint-disable-next-line no-underscore-dangle,no-undef
  const retweetButtonActiveClass = data.retweetUsers.includes(userLoggedIn._id) ? 'active' : '';

  let retweetText = '';
  if (isRetweet) {
    retweetText = `<span><i class='fas fa-retweet'></i> Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a></span>`;
  }

  let replyFlag = '';
  if (postData.replyTo) {
    // eslint-disable-next-line no-underscore-dangle
    if (!postData.replyTo._id) {
      return alert('Reply to is not populated');
      // eslint-disable-next-line no-underscore-dangle
    }
    // eslint-disable-next-line no-underscore-dangle
    if (!postData.replyTo.postedBy._id) {
      return alert('Posted by is not populated');
    }

    const replyToUsername = postData.replyTo.postedBy.username;
    replyFlag = `<div class='replyFlag'>Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a></div>`;
  }

  // eslint-disable-next-line no-underscore-dangle
  return `<div class='post' data-id='${data._id}'>
            <div class='postActionContainer'>
                ${retweetText}
            </div>
            <div class='mainContentContainer'>
                <div class='userImageContainer'>
                    <img src='${postedBy.profilePic}'>
                </div>
                <div class='postContentContainer'>
                    <div class='header'>
                        <a
                        href='/profile/${postedBy.username}'
                        class='displayName'>${displayName}
                        </a>
                        <span class='username'>@${postedBy.username}</span>
                        <span class='date'>${timestamp}</span>
                    </div>
                    ${replyFlag}
                    <div class='postBody'>
                        <span>${data.content}</span>
                    </div>
                    <div class='postFooter'>
                        <div class='postButtonContainer'>
                            <button data-toggle='modal' data-target='#replyModal'>
                                <i class='far fa-comment'></i>
                            </button>
                        </div>
                        <div class='postButtonContainer green'>
                            <button class='retweetButton ${retweetButtonActiveClass}'>
                                <i class='fas fa-retweet'></i>
                                <span>${data.retweetUsers.length || ''}</span>
                            </button>
                        </div>
                        <div class='postButtonContainer red'>
                            <button class='likeButton ${likeButtonActiveClass}'>
                                <i class='far fa-heart'></i>
                                <span>${data.likes.length || ''}</span>
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

function outputPosts(results, container) {
  container.html('');
  let resultArray;

  if (!Array.isArray(results)) {
    resultArray = [results];
  } else {
    resultArray = results;
  }

  resultArray.forEach((result) => {
    // eslint-disable-next-line no-undef
    const html = createPostHtml(result);
    container.append(html);
  });

  if (!resultArray.length) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}
