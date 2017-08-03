<?php
function chpasswd($user, $old_pass, $new_pass)
{
	exec("sudo -u $user ./tools/expect_passwd $old_pass $new_pass", $out, $ret);
	return [$ret, $out];
}

function validate($reset, $user, $old_pass, $new_pass, $new_pass2, &$msg)
{
	$id_pat = '/^[a-z][a-z0-9\-_]+$/';
	$id_pat2 = "/^uid=\d+($user) gid=\d+($user)";
	$pass_pat = '/^[\w[:punct:]]+$/';
	$pass_pat2 = '/^(?=.{12,})(?=.*[A-Z])(?=.*\d)(?=.*[[:punct:]])[\w[:punct:]]+$/';

	if (!preg_match($id_pat, $user))
	{
		$msg = 'Invalid username';
		return 1;
	}
	exec("id $user", $out, $ret);
	if ($ret)
	{
		$msg = 'Wrong username';
		return 1;
	}
	if (!$reset)
	{
		if (!preg_match($pass_pat, $old_pass))
		{
			$msg = 'Invalid old password';
			return 2;
		}
		if (!preg_match($pass_pat2, $new_pass))
		{
			$msg = 'Invalid new password';
			return 2;
		}
		if ($new_pass != $new_pass2)
		{
			$msg = 'Passwords do not match';
			return 3;
		}
	}
	return 0;
}

$reset = $_POST['reset'];
if (!$reset)
{
	$user = $_POST['user'];
	$old_pass = $_POST['old_pass'];
	$new_pass = $_POST['new_pass'];
	$new_pass2 = $_POST['new_pass2'];

	$ret = validate($reset, $user, $old_pass, $new_pass, $new_pass2, $msg);
	if (!$ret)
		$data = chpasswd($user, $old_pass, $new_pass);
	else
		$data = [$ret, $msg];
}
else
{
	// user not exist
	if (preg_match('', exec("id $user", $out, $ret)))
		$data = [1, 'Wrong user!'];
	else
	{
		$new_pass = exec('pwgen -sy 12 1');
		$out = shell_exec("echo $user:$new_pass | sudo chpasspwd");
		
	}
}
echo json_encode($data);
?>
