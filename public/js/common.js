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
  return postData.content;
}
