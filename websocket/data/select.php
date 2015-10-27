<?php

	error_reporting(E_ALL);

	include 'conn.php';

	$room = $_GET['r'];

	$query = "SELECT * FROM posts WHERE room = '$room'";

	$result = $mysqli->query($query) or die($mysqli->error);

	$data = array();

	while ($row = $result->fetch_assoc() ) {
		$obj = new stdClass();
		$obj->id = $row['id'];

		$values = array($row['picture'], $row['name'], $row['comment'], $row['date']);

		$obj->values = $values;

		$data[] = $obj;
	}

	$arr = array('data' => $data);

	echo json_encode($arr);