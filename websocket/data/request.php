<?php

	if(isset($_POST['authkey']) && $_POST['authkey'] == 'kZfe0QItY9okg25SGF9EMRqi9MI0JpRwpSBAqtYH9VSPA1AYDk6ZjmjJlt8jiDVL'){

		if(isset($_POST['mode'])){

			include('conn.php');

			$mode = (isset($_POST['mode'])) ? $_POST['mode'] : NULL;
			$user = (isset($_POST['u'])) ? $_POST['u'] : NULL;
			$pass = (isset($_POST['p'])) ? $_POST['p'] : NULL;

			if($mode == "save"){

				$data = $_POST['d'];
				$query = "UPDATE disks SET data = '$data' WHERE user = '$user' AND pass = MD5('$pass') LIMIT 1";
				$result = $mysqli->query($query) or die($mysqli->error);
				echo 'done';

			}else if($mode == "get"){

				$userQueryString = "SELECT * FROM users WHERE user = '$user' AND pass = MD5('$pass') LIMIT 1";
				$userQueryResult = $mysqli->query($userQueryString) or die($mysqli->error);

				if($userQueryResult->num_rows){
					$user = $userQueryResult->fetch_assoc();
					$ip = $user['ip'];

					$diskQueryString = "SELECT * FROM disks WHERE ip_ref = '$ip' LIMIT 1";
					$diskQueryResult = $mysqli->query($diskQueryString) or die($mysqli->error);
					$disk = $diskQueryResult->fetch_assoc();

					$diskData = json_decode($disk['data']);

					$programQueryString = "SELECT * FROM programs WHERE ip_ref = '$ip'";
					$programQueryResult = $mysqli->query($programQueryString) or die($mysqli->error);

					$hardwareQueryString = "SELECT * FROM hardwares WHERE ip_ref = '$ip'";
					$hardwareQueryResult = $mysqli->query($hardwareQueryString) or die($mysqli->error);

					$internetQueryString = "SELECT * FROM internet_users_config WHERE ip_ref = '$ip' LIMIT 1";
					$internetQueryResult = $mysqli->query($internetQueryString) or die($mysqli->error);

					$programs = array();
					$processes = array();
					$hardwares = array();
					$internet = $internetQueryResult->fetch_assoc();

					while( $line = $programQueryResult->fetch_assoc() ) {
						unset($line['ip_ref']);

						if($line['type'] == 0) { // program
							array_push($programs, $line);
						} else {
							array_push($processes, $line);
						}
					}

					while( $hardware = $hardwareQueryResult->fetch_assoc() ) {
						unset($hardware['ip_ref']);
						$config_obj = json_decode($hardware['config']);
						$hardware['config'] = $config_obj;
						array_push($hardwares, $hardware);
					}

					echo json_encode(array(
						"storage" => $diskData,
						"programs" => $programs,
						"processes" => $processes,
						"hardwares" => $hardwares,
						"internet" => $internet
					));

				}else{
					echo 404;
				}
			} else if ($mode == "getProgramDefs") {
				$query = "SELECT * FROM programs_def";
				$result = $mysqli->query($query) or die($mysqli->error);

				if($result->num_rows) {
					$arr = array();
					while( $r = $result->fetch_assoc() ) {
						$program_name = $r['name'];
						unset($r['name']);
						$arr[$program_name] = $r;
					}

					echo json_encode($arr);
				}
			}
		}else{
			echo "no mode set";
		}

	} else {
		echo 'forbiden access';
	}

	// test data url
	// http://localhost/cmd/websocket/data/request.php?mode=get&authkey=kZfe0QItY9okg25SGF9EMRqi9MI0JpRwpSBAqtYH9VSPA1AYDk6ZjmjJlt8jiDVL&u=rodrigorhas&p=123
?>