<?php
error_reporting(E_ALL);
	include 'conn.php';

	$room = $_GET['r'];
	$data = $_GET['data'];

	$data = json_decode($data);

	print_r($data);

	$sender = $_GET['sender'];
	$picture = $data->picture;
	$comment = $data->message;

	$query = "INSERT INTO posts (name, picture, comment,posts.`date`, room) VALUES ('$sender', '$picture', '$comment', NOW(), '$room')";

	$result = $mysqli->query($query) or die($mysqli->error);	

	echo $query;