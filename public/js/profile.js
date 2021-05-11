$(document).ready(() => {
  if (selectedTab === 'replies') {
    loadReplies();
  } else {
    loadPosts();
  }
});

function loadPosts() {
  $.get('/api/posts', { postedBy: profileUserId, pinned: true }, (results) => {
    outputPinnedPost(results, $('.pinnedPostContainer'));
  });

  $.get('/api/posts', { postedBy: profileUserId, isReply: false }, (results) => {
    $('.loadingSpinnerContainer').remove();
    $('.postsContainer').css('visibility', 'visible');
    outputPosts(results, $('.postsContainer'));
  });
}

function loadReplies() {
  $.get('/api/posts', { postedBy: profileUserId, isReply: true }, (results) => {
    $('.loadingSpinnerContainer').remove();
    $('.postsContainer').css('visibility', 'visible');
    outputPosts(results, $('.postsContainer'));
  });
}

function outputPinnedPost(results, container) {
  if (!results.length) {
    container.hide();
    return;
  }
  container.html('');

  results.forEach((result) => {
    const html = createPostHtml(result);
    container.append(html);
  });
}
