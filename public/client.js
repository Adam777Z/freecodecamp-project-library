document.addEventListener('DOMContentLoaded', (event) => {
	var books = [];
	var books_html = '';
	var comments_html = '';

	fetch('/api/books', {
		'method': 'GET'
	})
	.then((response) => {
		if (response['ok']) {
			return response.json();
		} else {
			throw 'Error';
		}
	})
	.then((data) => {
		books = data;
		loadBooks();
	})
	.catch((error) => {
		console.log(error);
	});

	function loadBooks() {
		if (books.length) {
			books_html = '';

			for (let [i, val] of Object.entries(books)) {
				books_html += `<li class="bookItem" id="book-${i}">${val['title']} - ${val['commentcount']} comments</li>`;
			}

			document.querySelector('#books').innerHTML = books_html;
		}
	}

	// For #sampleposting to update form action URL to test input Book ID
	document.querySelector('#commentTest').addEventListener('submit', (event2) => {
		let id = document.querySelector('#idinputtest').value;
		event2.target.setAttribute('action', '/api/books/' + id);
	});

	document.querySelector('#books').addEventListener('click', (event2) => {
		if (event2.target.classList.contains('bookItem')) {
			let this_id = event2.target.id.replace('book-', '');
			document.querySelector('#detailTitle').innerHTML = '<b>' + books[this_id]['title'] + '</b> (id: ' + books[this_id]['_id'] + ')';

			fetch('/api/books/' + books[this_id]['_id'], {
				'method': 'GET'
			})
			.then((response) => {
				if (response['ok']) {
					return response.text();
				} else {
					throw 'Error';
				}
			})
			.then((data) => {
				try {
					data = JSON.parse(data);
				} catch (error) {
					// console.log(error);
				}

				comments_html = '';

				for (let [i, val] of Object.entries(data['comments'])) {
					comments_html += `<li>${val}</li>`;
				}

				let new_comment_form_html = `
				<form id="newCommentForm">
					<input type="text" class="form-control mb-2" id="commentToAdd" name="comment" placeholder="New Comment">
					<button type="button" class="btn btn-primary mb-2 addComment" id="${data['_id']}" data-i="${this_id}">Add Comment</button><br>
					<button type="button" class="btn btn-danger deleteBook" id="${data['_id']}" data-i="${this_id}">Delete Book</button>
				</form>
				`;

				document.querySelector('#bookComments').innerHTML = comments_html;
				document.querySelector('#bookForm').innerHTML = new_comment_form_html;
			})
			.catch((error) => {
				console.log(error);
			});
		}
	});

	document.querySelector('#bookDetail').addEventListener('click', (event2) => {
		if (event2.target.classList.contains('addComment')) {
			event2.preventDefault();

			let this_id = event2.target.dataset['i'];
			let newComment = document.querySelector('#commentToAdd').value;

			fetch('/api/books/' + event2.target.id, {
				'method': 'POST',
				'body': new URLSearchParams(new FormData(document.querySelector('#newCommentForm')))
			})
			.then((response) => {
				if (response['ok']) {
					return response.text();
				} else {
					throw 'Error';
				}
			})
			.then((data) => {
				try {
					data = JSON.parse(data);
				} catch (error) {
					// console.log(error);
				}

				if (data['error'] !== undefined) {
					alert(data['error']);
				} else if (data['comments'] === undefined) {
					// update list
					document.querySelector('#detailTitle').innerHTML = '<p style="color: red;">' + data + '</p>';

					if (data == 'no book exists') {
						document.querySelector('#bookComments').innerHTML = '';
						document.querySelector('#bookForm').innerHTML = '';
						document.querySelector('#book-' + this_id).remove();
						books.splice(this_id, 1);
					}
				} else {
					document.querySelector('#commentToAdd').value = '';
					comments_html += `<li>${newComment}</li>`; // add new comment to bottom of list
					document.querySelector('#bookComments').innerHTML = comments_html;
					books[this_id]['commentcount']++;
					document.querySelector('#book-' + this_id).innerHTML = books[this_id]['title'] + ' - ' + books[this_id]['commentcount'] + ' comments';
				}
			})
			.catch((error) => {
				console.log(error);
			});
		}

		if (event2.target.classList.contains('deleteBook')) {
			event2.preventDefault();

			if (confirm('Are you sure you want to delete this book?')) {
				let this_id = event2.target.dataset['i'];

				fetch('/api/books/' + event2.target.id, {
					'method': 'DELETE',
					// 'body': new URLSearchParams(new FormData(document.querySelector('#newCommentForm')))
				})
				.then((response) => {
					if (response['ok']) {
						return response.text();
					} else {
						throw 'Error';
					}
				})
				.then((data) => {
					try {
						data = JSON.parse(data);
					} catch (error) {
						// console.log(error);
					}

					if (data['error'] !== undefined) {
						alert(data['error']);
					} else {
						// update list
						document.querySelector('#detailTitle').innerHTML = '<p style="color: red;">' + data + '</p>';
						document.querySelector('#bookComments').innerHTML = '';
						document.querySelector('#bookForm').innerHTML = '';
						document.querySelector('#book-' + this_id).remove();
						books.splice(this_id, 1);
					}
				})
				.catch((error) => {
					console.log(error);
				});
			}
		}
	});

	document.querySelector('#newBook').addEventListener('click', (event2) => {
		event2.preventDefault();

		fetch('/api/books', {
			'method': 'POST',
			'body': new URLSearchParams(new FormData(document.querySelector('#newBookForm')))
		})
		.then((response) => {
			if (response['ok']) {
				return response.text();
			} else {
				throw 'Error';
			}
		})
		.then((data) => {
			try {
				data = JSON.parse(data);
			} catch (error) {
				// console.log(error);
			}

			if (data['error'] !== undefined) {
				alert(data['error']);
			} else {
				document.querySelector('#newBookForm').reset();

				// update list
				data['commentcount'] = 0;
				books.push(data);
				loadBooks();
			}
		})
		.catch((error) => {
			console.log(error);
		});
	});

	document.querySelector('#deleteAllBooks').addEventListener('click', (event2) => {
		if (confirm('Are you sure you want to delete all books?')) {
			fetch('/api/books', {
				'method': 'DELETE',
				// 'body': new URLSearchParams(new FormData(document.querySelector('#newBookForm')))
			})
			.then((response) => {
				if (response['ok']) {
					return response.text();
				} else {
					throw 'Error';
				}
			})
			.then((data) => {
				try {
					data = JSON.parse(data);
				} catch (error) {
					// console.log(error);
				}

				// update list
				books = [];
				books_html = '';

				document.querySelector('#books').innerHTML = '';
				document.querySelector('#detailTitle').innerHTML = 'Select a book to see its details and comments';
				document.querySelector('#bookComments').innerHTML = '';
				document.querySelector('#bookForm').innerHTML = '';

				alert(data);
			})
			.catch((error) => {
				console.log(error);
			});
		}
	});
});