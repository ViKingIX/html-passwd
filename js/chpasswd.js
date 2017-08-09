function reset_form()
{
	$("#msg").prop('class', '').html('');
	$('#form').children().removeClass('has-danger').children().removeClass('form-control-danger');
	return;
}

function validate(reset, user, old_pass, new_pass, new_pass2)
{
	var id_pat = /^[a-z][a-z0-9_-]+$/;
	var pass_pat = /^[\w`~!@#$%^&*()\-_=+[{\]}\\|;:'",<.>\/?]+$/;

	if (!id_pat.exec(user))
	{
		$('input[name=user]').addClass('form-control-danger');
		$('input[name=user]').parent().addClass('has-danger');
		return [1, 'Invalid username'];
	}
	if (reset)
		return [0, ''];
	if (!pass_pat.exec(old_pass))
	{
		console.log(`old pass: ${old_pass}`);
		$('input[name=old_pass]').addClass('form-control-danger');
		$('input[name=old_pass]').parent().addClass('has-danger');
		return [2, 'Invalid old password'];
	}
	if (!pass_pat.exec(new_pass))
	{
		$('input[name=new_pass]').addClass('form-control-danger');
		$('input[name=new_pass]').parent().addClass('has-danger');
		return [3, 'Invalid new password'];
	}
	if (new_pass != new_pass2)
	{
		$('input[name=new_pass2]').addClass('form-control-danger');
		$('input[name=new_pass2]').parent().addClass('has-danger');
		return [4, 'Passwords do not match'];
	}
	return [0, ''];
}

$(document).ready(function() {
	$reset = 0;

	$("#form").on('submit', function (event) {
		event.preventDefault();
		reset_form();
		let data = $(this).serializeArray();
		let reset = $reset;
			user = data[0].value,
			old_pass = data[1].value,
			new_pass = data[2].value,
			new_pass2 = data[3].value;
		let data2 = {reset, user, old_pass, new_pass, new_pass2};

		let [ret, msg] = validate(reset, user, old_pass, new_pass, new_pass2);
		if (ret)
		{
			$('#msg').prop('class', 'alert alert-danger').html(msg);
			return;
		}
		$.post('pam.php', data2, function (data) {
			console.log('pam.php: ', data);
			let [ret, msg] = JSON.parse(data);
			if (ret)
				$('#msg').prop('class', 'alert alert-danger').html(msg);
			else
				$('#msg').prop('class', 'alert alert-success').html('<strong>Success!</strong>');
			return;
		});
	});

	$('#change_btn').on('click', function (event) {
		$reset = 0;
	});
	$('#reset_btn').on('click', function (event) {
		$reset = 1;
	});
});
