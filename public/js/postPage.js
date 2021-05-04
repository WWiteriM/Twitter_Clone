// eslint-disable-next-line no-undef
$(document).ready(() => {
  // eslint-disable-next-line no-undef
  $.get(`/api/posts/${postId}`, (results) => {
    // eslint-disable-next-line no-undef
    outputPostsWithReplies(results, $('.postsContainer'));
  });
});
