function reset_form()
{
	$("#msg").css({'class': ''}).html('');
	$('#form').children().removeClass('has-danger').children().removeClass('form-control-danger');
	return;
}

function validate(reset, user, old_pass, new_pass, new_pass2)
{
	var id_pat = /^[a-z][a-z0-9_-]+$/;
	var pass_pat = /^[\w``~!@#$%^&*()\-_=+[{\]}\\|;:'",<.>\/?]+$/;

	if (!id_pat.exec(user))
	{
		$('#user').addClass('form-control-danger');
		$('#user').parent().addClass('has-danger');
		return 1;
	}
	if (reset)
		return 0;
	let pass_inval = false;
	for (let id of ['old_pass', 'new_pass', 'new_pass2'])
		if (!pass_pat.exec(eval(id)))
		{
			pass_inval = true;
			$('#' + id).addClass('form-control-danger');
			$('#' + id).parent().addClass('has-danger');
		}
	if (pass_inval)
		return 2;
	/*
	if (!pass_pat.exec(old_pass))
	{
		$('#old_pass').addClass('form-control-danger');
		$('#old_pass').parent().addClass('has-danger');
	}
	if (!pass_pat.exec(new_pass))
	{
		$('#new_pass').addClass('form-control-danger');
		$('#new_pass').parent().addClass('has-danger');
	}
	if (!pass_pat.exec(new_pass2))
	{
		$('#new_pass2').addClass('form-control-danger');
		$('#new_pass2').parent().addClass('has-danger');
		return 2;
	}
	*/
	if (new_pass != new_pass2)
	{
		$('#new_pass2').addClass('form-control-danger');
		$('#new_pass2').parent().addClass('has-danger');
		return 3;
	}
	return 0;
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

		console.log(reset, user, old_pass, new_pass, new_pass2);
		if (validate(reset, user, old_pass, new_pass, new_pass2))
			return;
		let jj = JSON.stringify(data2);
		$.post('pam.php', data2, function (data) {
			console.log('pam.php: ', data);
			let [ret, msg] = JSON.parse(data);
			console.log(ret, msg);
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
