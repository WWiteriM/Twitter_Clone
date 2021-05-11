$(document).ready(() => {
  $.get(`/api/chats/${chatId}`, (data) => {
    $('#chatName').text(getChatName(data));
  });
});

$('#chatNameButton').click(() => {
  const name = $('#chatNameTextBox').val().trim();

  $.ajax({
    url: `/api/chats/${chatId}`,
    type: 'PUT',
    data: { chatName: name },
    success: (data, status, xhr) => {
      if (xhr.status !== 204) {
        alert('Could not update');
      }
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    },
  });
});
