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

$('.sendMessageButton').click(() => {
  messageSubmitted();
});

$('.inputTextBox').keydown((event) => {
  if (event.which === 13 && !event.shiftKey) {
    messageSubmitted();
    return false;
  }
});

function messageSubmitted() {
  const content = $('.inputTextBox').val().trim();

  if (content) {
    sendMessage(content);
    $('.inputTextBox').val('');
  }
}

function sendMessage(content) {
  $.post('/messages', { content, chatId }, (data) => {
    console.log(data);
  });
}
