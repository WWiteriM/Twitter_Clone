$(document).ready(() => {
  if (selectedTab === 'followers') {
    loadFollowers();
  } else {
    loadFollowing();
  }
});

function loadFollowers() {
  $.get(`/api/users/${profileUserId}/followers`, (results) => {
    $('.loadingSpinnerContainer').remove();
    $('.resultsContainer').css('visibility', 'visible');
    outputUsers(results.followers, $('.resultsContainer'));
  });
}

function loadFollowing() {
  $.get(`/api/users/${profileUserId}/following`, (results) => {
    $('.loadingSpinnerContainer').remove();
    $('.resultsContainer').css('visibility', 'visible');
    outputUsers(results.following, $('.resultsContainer'));
  });
}
