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
