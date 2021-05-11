$(document).ready(() => {
  $.get(`/api/posts/${postId}`, (results) => {
    $('.loadingSpinnerContainer').remove();
    $('.postsContainer').css('visibility', 'visible');
    outputPostsWithReplies(results, $('.postsContainer'));
  });
});
