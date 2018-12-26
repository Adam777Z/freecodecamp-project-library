$(document).ready(function() {
	var items = [];
	var itemsRaw = [];
	var comments = [];

	$.getJSON('/api/books', function(data) {
		itemsRaw = data;
		loadBooks();
	});

	function loadBooks() {
		items = [];
		$.each(itemsRaw, function(i, val) {
			items.push('<li class="bookItem" id="' + i + '">' + val.title + ' - ' + val.commentcount + ' comments</li>');
			return (i !== 14);
		});
		if (items.length >= 15) {
			items.push('<p>...and ' + (itemsRaw.length - 15) + ' more!</p>');
		}
		$('<ul/>', {
			'class': 'listWrapper',
			html: items.join('')
		}).appendTo('#display');
	}

	$('#display').on('click', 'li.bookItem', function() {
		let this_id = this.id;
		$('#detailTitle').html('<b>' + itemsRaw[this.id]['title'] + '</b> (id: ' + itemsRaw[this.id]['_id'] + ')');
		$.getJSON('/api/books/' + itemsRaw[this.id]['_id'], function(data) {
			comments = [];

			$.each(data.comments, function(i, val) {
				comments.push('<li>' + val + '</li>');
			});

			let after_comments = [];
			after_comments.push('<form id="newCommentForm"><input type="text" class="form-control mb-2" id="commentToAdd" name="comment" placeholder="New Comment">');
			after_comments.push('<button class="btn btn-info mb-2 addComment" id="' + data._id + '" data-i="' + this_id + '">Add Comment</button><br>');
			after_comments.push('<button class="btn btn-danger deleteBook" id="' + data._id + '" data-i="' + this_id + '">Delete Book</button></form>');
			$('#detailComments').html(comments.join(''));
			$('#detailForm').html(after_comments.join(''));
		});
	});

	$('#bookDetail').on('click', 'button.addComment', function(e) {
		e.preventDefault();
		let this_id = $(this).data('i');
		var newComment = $('#commentToAdd').val();
		$.ajax({
			url: '/api/books/' + this.id,
			type: 'post',
			dataType: 'json',
			data: $('#newCommentForm').serialize(),
			success: function(data) {
				// comments.unshift('<li>' + newComment + '</li>'); // add new comment to top of list
				comments.push('<li>' + newComment + '</li>');
				$('#detailComments').html(comments.join(''));
				itemsRaw[this_id]['commentcount']++;
				$('#' + this_id).html(itemsRaw[this_id]['title'] + ' - ' + itemsRaw[this_id]['commentcount'] + ' comments');
			}
		});
	});

	$('#bookDetail').on('click', 'button.deleteBook', function(e) {
		e.preventDefault();
		let this_id = $(this).data('i');
		$.ajax({
			url: '/api/books/' + this.id,
			type: 'delete',
			success: function(data) {
				// update list
				$('#detailTitle').html('');
				$('#detailComments').html('<p style="color: red;">' + data + '<p><p><a href="/">Refresh the page</a></p>');
				$('#detailForm').html('');
				itemsRaw.splice(this_id, 1);
				// $('#'+this_id).remove();
				$('#display').html('');
				loadBooks();
			}
		});
	});

	$('#newBook').click(function(e) {
		e.preventDefault();
		$.ajax({
			url: '/api/books',
			type: 'post',
			dataType: 'json',
			data: $('#newBookForm').serialize(),
			success: function(data) {
				// update list
				data.commentcount = 0;
				itemsRaw.push(data);
				$('#display').html('');
				loadBooks();
			}
		});
	});

	$('#deleteAllBooks').click(function(e) {
		e.preventDefault();
		$.ajax({
			url: '/api/books',
			type: 'delete',
			dataType: 'json',
			data: $('#newBookForm').serialize(),
			success: function(data) {
				// update list
				items = [];
				itemsRaw = [];
				$('#display').html('');
				$('#detailTitle').html('Select a book to see its details and comments');
				$('#detailComments').html('');
				$('#detailForm').html('');
			}
		});
	});
});