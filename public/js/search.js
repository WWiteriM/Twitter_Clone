$('#searchBox').keydown(async (event) => {
  clearTimeout(timer);
  $('.resultsContainer').html('');
  const textBox = $(event.target);
  const searchType = textBox.data().search;
  let value = textBox.val();

  await $('.loadingSpinnerContainer').css('display', 'flex');

  timer = await setTimeout(() => {
    value = textBox.val().trim();

    if (!value) {
      $('.resultsContainer').html('');
      $('.loadingSpinnerContainer').css('display', 'none');
    } else {
      search(value, searchType);
    }
  }, 1000);
});

function search(searchTerm, searchType) {
  const url = searchType === 'users' ? '/api/users' : '/api/posts';

  $.get(url, { search: searchTerm }, (results) => {
    if (searchType === 'users') {
      $('.loadingSpinnerContainer').css('display', 'none');
      $('.resultsContainer').css('visibility', 'visible');
      outputUsers(results, $('.resultsContainer'));
    } else {
      $('.loadingSpinnerContainer').css('display', 'none');
      $('.resultsContainer').css('visibility', 'visible');
      outputPosts(results, $('.resultsContainer'));
    }
  });
}
