document.addEventListener('DOMContentLoaded', (event) => {
	var items = [];
	var itemsRaw = [];
	var comments = [];

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
		itemsRaw = data;
		loadBooks();
	})
	.catch((error) => {
		console.log(error);
	});

	function loadBooks() {
		if (itemsRaw.length) {
			items = [];

			items.push('<ul class="listWrapper">');

			for (let [i, val] of Object.entries(itemsRaw)) {
				// i = parseInt(i);

				// Show at most 15
				// if (i+1 > 15) {
				// 	break;
				// }

				items.push('<li class="bookItem" id="book-' + i + '">' + val['title'] + ' - ' + val['commentcount'] + ' comments</li>');
			}

			// Show at most 15
			// if (itemsRaw.length > 15) {
			// 	items.push('<p>...and ' + (itemsRaw.length - 15) + ' more</p>');
			// }

			items.push('</ul>');

			document.querySelector('#display').innerHTML = items.join('');
		}
	}

	// For #sampleposting to update form action URL to test input Book ID
	document.querySelector('#commentTest').addEventListener('submit', (event2) => {
		let id = document.querySelector('#idinputtest').value;
		event2.target.setAttribute('action', '/api/books/' + id);
	});

	document.querySelector('#display').addEventListener('click', (event2) => {
		if (event2.target.classList.contains('bookItem')) {
			let this_id = event2.target.id.replace('book-', '');
			document.querySelector('#detailTitle').innerHTML = '<b>' + itemsRaw[this_id]['title'] + '</b> (id: ' + itemsRaw[this_id]['_id'] + ')';

			fetch('/api/books/' + itemsRaw[this_id]['_id'], {
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

				comments = [];

				for (let [i, val] of Object.entries(data['comments'])) {
					comments.push('<li>' + val + '</li>');
				}

				let after_comments = [];

				after_comments.push('<form id="newCommentForm"><input type="text" class="form-control mb-2" id="commentToAdd" name="comment" placeholder="New Comment">');
				after_comments.push('<button class="btn btn-primary mb-2 addComment" id="' + data['_id'] + '" data-i="' + this_id + '">Add Comment</button><br>');
				after_comments.push('<button class="btn btn-danger deleteBook" id="' + data['_id'] + '" data-i="' + this_id + '">Delete Book</button></form>');

				document.querySelector('#detailComments').innerHTML = comments.join('');
				document.querySelector('#detailForm').innerHTML = after_comments.join('');
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

				if (data['comments'] === undefined) {
					// update list if no book exists
					document.querySelector('#detailTitle').innerHTML = '';
					document.querySelector('#detailComments').innerHTML = '<p style="color: red;">' + data + '</p><p><a href="/">Refresh page</a></p>';
					document.querySelector('#detailForm').innerHTML = '';
					itemsRaw.splice(this_id, 1);
					// document.querySelector('#'+this_id).remove();
					// document.querySelector('#display').innerHTML = '';
					loadBooks();
				} else {
					// comments.unshift('<li>' + newComment + '</li>'); // add new comment to top of list
					comments.push('<li>' + newComment + '</li>');
					document.querySelector('#detailComments').innerHTML = comments.join('');
					itemsRaw[this_id]['commentcount']++;
					document.querySelector('#book-' + this_id).innerHTML = itemsRaw[this_id]['title'] + ' - ' + itemsRaw[this_id]['commentcount'] + ' comments';
				}

				document.querySelector('#commentToAdd').value = '';
			})
			.catch((error) => {
				console.log(error);
			});
		}

		if (event2.target.classList.contains('deleteBook')) {
			event2.preventDefault();

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

				// update list
				document.querySelector('#detailTitle').innerHTML = '';
				document.querySelector('#detailComments').innerHTML = '<p style="color: red;">' + data + '</p><p><a href="/">Refresh page</a></p>';
				document.querySelector('#detailForm').innerHTML = '';
				itemsRaw.splice(this_id, 1);
				// document.querySelector('#'+this_id).remove();
				// document.querySelector('#display').innerHTML = '';
				loadBooks();
			})
			.catch((error) => {
				console.log(error);
			});
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
				itemsRaw.push(data);
				// document.querySelector('#display').innerHTML = '';
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
				items = [];
				itemsRaw = [];
				document.querySelector('#display').innerHTML = '';
				document.querySelector('#detailTitle').innerHTML = 'Select a book to see its details and comments';
				document.querySelector('#detailComments').innerHTML = '';
				document.querySelector('#detailForm').innerHTML = '';
				alert(data);
			})
			.catch((error) => {
				console.log(error);
			});
		}
	});
});