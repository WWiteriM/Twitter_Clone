// eslint-disable-next-line no-undef
$('#postTextarea').keyup((event) => {
  // eslint-disable-next-line no-undef
  const textBox = $(event.target);
  const value = textBox.val().trim();

  // eslint-disable-next-line no-undef
  const submitButton = $('#submitPostButton');

  // if (!submitButton.length) return alert('No submit button found');

  if (!value) {
    return submitButton.prop('disabled', true);
  }

  return submitButton.prop('disabled', false);
});
