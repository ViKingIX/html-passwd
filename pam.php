<?php
require 'lib/phpmailer/PHPMailerAutoload.php';
require 'config.php';

function chpasswd($user, $old_pass, $new_pass)
{
	exec("sudo -u $user ./tools/expect_passwd $old_pass $new_pass", $out, $ret);
	return [$ret, $out];
}

function validate($reset, $user, $old_pass = '', $new_pass = '', $new_pass2 = '')
{
	$id_pat = '/^[a-z][a-z0-9\-_]+$/';
	$id_pat2 = "/^uid=\d+($user) gid=\d+($user)";
	$pass_pat = '/^[\w[:punct:]]+$/';
	$pass_pat2 = '/^(?=.{12,})(?=.*[A-Z])(?=.*\d)(?=.*[[:punct:]])[\w[:punct:]]+$/';

	if (!preg_match($id_pat, $user))
		return [1, 'Invalid username'];
	exec("id $user", $out, $ret);
	if ($ret)
		return [1, 'Wrong username'];
	if (!$reset)
	{
		if (!preg_match($pass_pat, $old_pass))
			return [2, 'Invalid old password'];
		if (!preg_match($pass_pat2, $new_pass))
			return [2, 'Invalid new password'];
		if ($new_pass != $new_pass2)
			return [3, 'Passwords do not match'];
	}
	return [0, ''];
}

$reset = $_POST['reset'];
$user = $_POST['user'];
if (!$reset)
{
	$old_pass = $_POST['old_pass'];
	$new_pass = $_POST['new_pass'];
	$new_pass2 = $_POST['new_pass2'];

	list($ret, $msg) = validate($reset, $user, $old_pass, $new_pass, $new_pass2);
	if (!$ret)
		$data = chpasswd($user, $old_pass, $new_pass);
	else
		$data = [$ret, $msg];
}
else
{
	list($ret, $msg) = validate($reset, $user);
	if (!$ret)
	{
		$new_pass = exec('pwgen -syn 12 1');
		$new_pass_escaped = escapeshellarg($new_pass);
		$out = shell_exec("echo $user:$new_pass_escaped | sudo chpasswd");

		$mail = new PHPMailer;
		$mail->isSMTP();
		$mail->Host = $MAIL_SERVER;
		$mail->Port = $MAIL_PORT;

		$mail->setFrom($MAIL_FROM, $MAIL_FROM_NAME);
		$mail->addAddress("$user@$MAILTO_DOMAIN", '');
		$mail->Subject = 'TACACS+ Password Recovery';
		$mail->isHTML(true);
		$mail->Body = "Dear $user,<br><br>\n"
					. "<p style=\"padding-left: 2em\">Your new password is <span style=\"color: red\"><strong><tt>$new_pass</tt></strong></span></p>";
		if (!$mail->send())
			$data = [8, $mail->ErrorInfo];
		else
			$data = [0, 'Success!'];
	}
	else
		$data = [$ret, $msg];
}
echo json_encode($data);
?>
