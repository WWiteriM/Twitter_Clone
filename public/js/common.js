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

function createPostHtml(postData) {
  const { postedBy } = postData;

  const displayName = `${postedBy.firstName} ${postedBy.lastName}`;
  const timestamp = postData.createdAt;

  return `<div class='post'>
            <div class='mainContentContainer'>
                <div class='userImageContainer'>
                    <img src='${postedBy.profilePic}'>
                </div>
                <div class='postContentContainer'>
                    <div class='header'>
                        <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
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
                        <div class='postButtonContainer'>
                            <button>
                                <i class='fas fa-retweet'></i>
                            </button>
                        </div>
                        <div class='postButtonContainer'>
                            <button>
                                <i class='far fa-heart'></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>`;
}
