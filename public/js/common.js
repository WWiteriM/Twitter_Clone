const selectedUsers = [];
let cropper;
let timer;

$('#postTextarea, #replyTextarea').keyup((event) => {
  const textBox = $(event.target);
  const value = textBox.val().trim();

  const isModal = textBox.parents('.modal').length === 1;

  const submitButton = isModal ? $('#submitReplyButton') : $('#submitPostButton');

  if (!value) {
    return submitButton.prop('disabled', true);
  }

  return submitButton.prop('disabled', false);
});

// eslint-disable-next-line consistent-return
$('#submitPostButton, #submitReplyButton ').click((event) => {
  const button = $(event.target);

  const isModal = button.parents('.modal').length === 1;
  const textBox = isModal ? $('#replyTextarea') : $('#postTextarea');

  const data = {
    content: textBox.val(),
  };

  if (isModal) {
    const { id } = button.data();
    if (!id) return alert('Button id is null');
    data.replyTo = id;
  }

  $.post('api/posts', data, (postData) => {
    if (postData.replyTo) {
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    } else {
      const html = createPostHtml(postData);
      $('.postsContainer').prepend(html);
      textBox.val('');
      button.prop('disabled', true);
    }
  });
});

$('#replyModal')
  .on('show.bs.modal', (event) => {
    const button = $(event.relatedTarget);
    const postId = getPostIdFromElement(button);
    $('#submitReplyButton').data('id', postId);

    $.get(`api/posts/${postId}`, (results) => {
      outputPosts(results.postData, $('#originalPostContainer'));
    });
  })
  .on('hidden.bs.modal', () => {
    $('#originalPostContainer').html('');
  });

$('#deletePostModal').on('show.bs.modal', (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $('#deletePostButton').data('id', postId);
});

$('#confirmPinModal').on('show.bs.modal', (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $('#pinPostButton').data('id', postId);
});

$('#unpinModal').on('show.bs.modal', (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $('#unpinPostButton').data('id', postId);
});

$('#deletePostButton').click((event) => {
  const postId = $(event.target).data('id');

  $.ajax({
    url: `/api/posts/${postId}`,
    type: 'DELETE',
    success: (data, status, xhr) => {
      if (xhr.status !== 202) {
        alert('Could not delete the post');
        return;
      }
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    },
  });
});

$('#pinPostButton').click((event) => {
  const postId = $(event.target).data('id');

  $.ajax({
    url: `/api/posts/${postId}`,
    type: 'PUT',
    data: { pinned: true },
    success: (data, status, xhr) => {
      if (xhr.status !== 204) {
        alert('Could not pin the post');
        return;
      }
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    },
  });
});

$('#unpinPostButton').click((event) => {
  const postId = $(event.target).data('id');

  $.ajax({
    url: `/api/posts/${postId}`,
    type: 'PUT',
    data: { pinned: false },
    success: (data, status, xhr) => {
      if (xhr.status !== 204) {
        alert('Could not unpin the post');
        return;
      }
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    },
  });
});

$('#filePhoto').change(function () {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = document.getElementById('imagePreview');
      image.src = e.target.result;

      if (cropper) {
        cropper.destroy();
      }
      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: false,
      });
    };
    reader.readAsDataURL(this.files[0]);
  }
});

$('#coverPhoto').change(function () {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = document.getElementById('coverPreview');
      image.src = e.target.result;

      if (cropper) {
        cropper.destroy();
      }
      cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        background: false,
      });
    };
    reader.readAsDataURL(this.files[0]);
  }
});

$('#imageUploadButton').click(() => {
  const canvas = cropper.getCroppedCanvas();

  if (!canvas) {
    alert('Could not upload image. Make sure it is an image file.');
    return;
  }
  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append('croppedImage', blob);

    $.ajax({
      url: '/api/users/profilePicture',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      // eslint-disable-next-line no-restricted-globals
      success: () => location.reload(),
    });
  });
});

$('#coverPhotoButton').click(() => {
  const canvas = cropper.getCroppedCanvas();

  if (!canvas) {
    alert('Could not upload image. Make sure it is an image file.');
    return;
  }
  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append('croppedImage', blob);

    $.ajax({
      url: '/api/users/coverPhoto',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      // eslint-disable-next-line no-restricted-globals
      success: () => location.reload(),
    });
  });
});

$('#userSearchTextBox').keydown((event) => {
  clearTimeout(timer);
  const textBox = $(event.target);
  let value = textBox.val();

  if (!value && event.keyCode === 8) {
    selectedUsers.pop();
    updateSelectedUsersHtml();
    $('.resultsContainer').html('');

    if (selectedUsers.length === 0) {
      $('#createChatButton').prop('disabled', true);
    }
    return;
  }

  timer = setTimeout(() => {
    value = textBox.val().trim();

    if (!value) {
      $('.resultsContainer').html('');
    } else {
      searchUsers(value);
    }
  }, 1000);
});

$('#createChatButton').click(() => {
  const data = JSON.stringify(selectedUsers);

  $.post('/api/chats', { users: data }, (chat) => {
    window.location.href = `/messages/${chat._id}`;
  });
});

$(document).on('click', '.likeButton', (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElement(button);

  if (!postId) return;

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: 'PUT',
    success: (postData) => {
      button.find('span').text(postData.likes.length || '');

      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass('active');
      } else {
        button.removeClass('active');
      }
    },
  });
});

$(document).on('click', '.retweetButton', (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElement(button);

  if (!postId) return;

  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: 'POST',
    success: (postData) => {
      button.find('span').text(postData.retweetUsers.length || '');

      if (postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass('active');
      } else {
        button.removeClass('active');
      }
    },
  });
});

$(document).on('click', '.post', (event) => {
  const element = $(event.target);
  const postId = getPostIdFromElement(element);

  if (postId && !element.is('button')) {
    window.location.href = `/posts/${postId}`;
  }
});

$(document).on('click', '.followButton', (event) => {
  const button = $(event.target);
  const userId = button.data().user;

  $.ajax({
    url: `/api/users/${userId}/follow`,
    type: 'PUT',
    success: (data, status, xhr) => {
      if (xhr.status === 404) {
        alert('User not found');
        return;
      }

      let difference = 1;
      if (data.following && data.following.includes(userId)) {
        button.addClass('following');
        button.text('Following');
      } else {
        button.removeClass('following');
        button.text('Follow');
        difference = -1;
      }

      const followersLabel = $('#followersValue');
      if (followersLabel.length) {
        let followersText = followersLabel.text();
        followersText = parseInt(followersText, 10);
        followersLabel.text(followersText + difference);
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

function createPostHtml(postData, largeFont = false) {
  const isRetweet = postData.retweetData !== undefined;
  const retweetedBy = isRetweet ? postData.postedBy.username : null;
  const data = isRetweet ? postData.retweetData : postData;

  const { postedBy } = data;
  const displayName = `${postedBy.firstName} ${postedBy.lastName}`;
  const timestamp = timeDifference(new Date(), new Date(data.createdAt));

  const likeButtonActiveClass = data.likes.includes(userLoggedIn._id) ? 'active' : '';
  const retweetButtonActiveClass = data.retweetUsers.includes(userLoggedIn._id) ? 'active' : '';
  const largeFontClass = largeFont ? 'largeFont' : '';

  let retweetText = '';
  if (isRetweet) {
    retweetText = `<span><i class='fas fa-retweet'></i> Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a></span>`;
  }

  let replyFlag = '';
  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
      return alert('Reply to is not populated');
    }
    if (!postData.replyTo.postedBy._id) {
      return alert('Posted by is not populated');
    }

    const replyToUsername = postData.replyTo.postedBy.username;
    replyFlag = `<div class='replyFlag'>Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a></div>`;
  }

  let buttons = '';
  let pinnedPostText = '';
  if (postData.postedBy._id === userLoggedIn._id) {
    let pinnedClass = '';
    let dataTarget = '#confirmPinModal';
    if (postData.pinned) {
      pinnedClass = 'active';
      dataTarget = '#unpinModal';
      pinnedPostText = "<i class='fas fa-thumbtack'></i> <span>Pinned post</span>";
    }

    buttons = `<button class='pinButton ${pinnedClass}' data-id='${postData._id}' data-toggle='modal' data-target='${dataTarget}'><i class='fas fa-thumbtack'></i></button>
               <button data-id='${postData._id}' data-toggle='modal' data-target='#deletePostModal'><i class='fas fa-times'></i></button>`;
  }

  return `<div class='post ${largeFontClass}' data-id='${data._id}'>
            <div class='postActionContainer'>
                ${retweetText}
            </div>
            <div class='mainContentContainer'>
                <div class='userImageContainer'>
                    <img src='${postedBy.profilePic}'>
                </div>
                <div class='postContentContainer'>
                    <div class='pinnedPostText'>${pinnedPostText}</div>
                    <div class='header'>
                        <a
                        href='/profile/${postedBy.username}'
                        class='displayName'>${displayName}
                        </a>
                        <span class='username'>@${postedBy.username}</span>
                        <span class='date'>${timestamp}</span>
                        ${buttons}
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
    const html = createPostHtml(result);
    container.append(html);
  });

  if (!resultArray.length) {
    container.append("<span class='noResults'>You have nothing to show.</span>");
  }
}

// eslint-disable-next-line no-unused-vars
function outputPostsWithReplies(results, container) {
  container.html('');

  if (results.replyTo && results.replyTo._id) {
    const html = createPostHtml(results.replyTo);
    container.append(html);
  }

  const mainPostHtml = createPostHtml(results.postData, true);
  container.append(mainPostHtml);

  results.replies.forEach((result) => {
    const html = createPostHtml(result);
    container.append(html);
  });
}

// eslint-disable-next-line no-unused-vars
function outputUsers(results, container) {
  container.html('');

  results.forEach((result) => {
    const html = createUserHtml(result, true);
    container.append(html);
  });

  if (!results.length) {
    container.append("<span class='noResults'>No results found</span>");
  }
}

function outputSelectableUsers(results, container) {
  container.html('');

  results.forEach((result) => {
    if (result._id === userLoggedIn._id || selectedUsers.some((u) => u._id === result._id)) {
      return;
    }
    const html = createUserHtml(result, false);
    const element = $(html);

    element.click(() => userSelected(result));
    container.append(element);
  });

  if (!results.length) {
    container.append("<span class='noResults'>No results found</span>");
  }
}

function createUserHtml(userData, showFollowButton) {
  const name = `${userData.firstName} ${userData.lastName}`;
  const isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
  const text = isFollowing ? 'Following' : 'Follow';
  const buttonClass = isFollowing ? 'followButton following' : 'followButton';
  let followButton = '';

  if (showFollowButton && userLoggedIn._id !== userData._id) {
    followButton = `<div class='followButtonContainer'>
                        <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                    </div>`;
  }

  return `<div class='user'>
            <div class='userImageContainer'>
                <img src='${userData.profilePic}'>
            </div>
            <div class='userDetailsContainer'>
                <div class='header'>
                    <a 
                    href='/profile/${userData.username}'
                    class='displayName'
                    >${name}
                    </a>
                    <span class='username'>@${userData.username}</span>
                </div>
            </div>
            ${followButton}
          </div>`;
}

function searchUsers(searchTerm) {
  $.get('/api/users', { search: searchTerm }, (results) => {
    outputSelectableUsers(results, $('.resultsContainer'));
  });
}

function userSelected(user) {
  selectedUsers.push(user);
  updateSelectedUsersHtml();
  $('#userSearchTextBox').val('').focus();
  $('.resultsContainer').html('');
  $('#createChatButton').prop('disabled', false);
}

function updateSelectedUsersHtml() {
  const elements = [];

  selectedUsers.forEach((user) => {
    const name = `${user.firstName} ${user.lastName}`;
    const userElement = $(`<span class='selectedUser'>${name}</span>`);
    elements.push(userElement);
  });

  $('.selectedUser').remove();
  $('#selectedUsers').prepend(elements);
}
