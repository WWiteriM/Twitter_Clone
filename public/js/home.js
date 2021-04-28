// eslint-disable-next-line no-undef
$(document).ready(() => {
  // eslint-disable-next-line no-undef
  $.get('api/posts', (results) => {
    // eslint-disable-next-line no-undef
    outputPosts(results, $('.postsContainer'));
  });
});

function outputPosts(results, container) {
  container.html('');

  results.forEach((result) => {
    // eslint-disable-next-line no-undef
    const html = createPostHtml(result);
    container.append(html);
  });

  if (!results.length) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}
