$(document).ready(() => {
  $.get('api/posts', { followingOnly: true }, (results) => {
    $('.loadingSpinnerContainer').remove();
    $('.postsContainer').css('visibility', 'visible');
    outputPosts(results, $('.postsContainer'));
  });
});
