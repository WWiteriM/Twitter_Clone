// eslint-disable-next-line no-undef
$(document).ready(() => {
  // eslint-disable-next-line no-undef
  $.get('api/posts', (results) => {
    // eslint-disable-next-line no-undef
    outputPosts(results, $('.postsContainer'));
  });
});
