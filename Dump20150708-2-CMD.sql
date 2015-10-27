CREATE DATABASE  IF NOT EXISTS `cmd` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `cmd`;
-- MySQL dump 10.13  Distrib 5.5.43, for debian-linux-gnu (i686)
--
-- Host: 192.168.0.58    Database: cmd
-- ------------------------------------------------------
-- Server version	5.5.37-0ubuntu0.12.10.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `disks`
--

DROP TABLE IF EXISTS `disks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `disks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip_ref` varchar(15) DEFAULT NULL,
  `data` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disks`
--

LOCK TABLES `disks` WRITE;
/*!40000 ALTER TABLE `disks` DISABLE KEYS */;
INSERT INTO `disks` VALUES (1,'192.168.0.56','[{\"name\":\"C\",\"children\":[{\"name\":\"Programs\",\"children\":[{\"name\":\"crack\",\"extension\":\"bin\",\"properties\":{\"level\":1,\"experience\":0},\"children\":[],\"perms\":{\"writable\":true,\"readable\":true,\"visible\":true}}],\"perms\":{\"writable\":true,\"readable\":true,\"visible\":true}}],\"perms\":{\"writable\":true,\"readable\":true,\"visible\":true}}]'),(10,'192.168.0.74','[{\"name\":\"C\",\"children\":[{\"name\":\"Programs\",\"children\":[{\"name\":\"crack\",\"extension\":\"bin\",\"properties\":{\"level\":1,\"experience\":0},\"children\":[],\"perms\":{\"writable\":true,\"readable\":true,\"visible\":true}}],\"perms\":{\"writable\":true,\"readable\":true,\"visible\":true}}],\"perms\":{\"writable\":true,\"readable\":true,\"visible\":true}}]');
/*!40000 ALTER TABLE `disks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hardwares`
--

DROP TABLE IF EXISTS `hardwares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hardwares` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `ip_ref` varchar(15) DEFAULT NULL,
  `config` text,
  `HBF` int(11) DEFAULT NULL,
  `HMBF` double DEFAULT NULL,
  `USE_BASE` int(11) DEFAULT NULL,
  `upgrade_level` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hardwares`
--

LOCK TABLES `hardwares` WRITE;
/*!40000 ALTER TABLE `hardwares` DISABLE KEYS */;
INSERT INTO `hardwares` VALUES (1,'Memory','192.168.0.56','{\"max_usage\": 0}',5000,5.5,1,2);
/*!40000 ALTER TABLE `hardwares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `internet_users_config`
--

DROP TABLE IF EXISTS `internet_users_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `internet_users_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip_ref` varchar(15) DEFAULT NULL,
  `package_level` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `internet_users_config`
--

LOCK TABLES `internet_users_config` WRITE;
/*!40000 ALTER TABLE `internet_users_config` DISABLE KEYS */;
INSERT INTO `internet_users_config` VALUES (1,'192.168.0.56',5),(2,'192.168.0.74',10);
/*!40000 ALTER TABLE `internet_users_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `ip_ref` varchar(15) DEFAULT NULL,
  `memory_usage` int(11) DEFAULT NULL,
  `current_config` text,
  `level` int(11) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES (1,'cracker','192.168.0.56',0,'',2,1),(2,'hasher','192.168.0.56',0,NULL,2,1),(3,'cracker','192.168.0.74',0,NULL,1,1),(4,'hasher','192.168.0.74',0,'',1,1);
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs_def`
--

DROP TABLE IF EXISTS `programs_def`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programs_def` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `config` text,
  `MUBF` int(11) DEFAULT NULL,
  `MUMBF` double DEFAULT NULL,
  `MAX_LEVEL` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs_def`
--

LOCK TABLES `programs_def` WRITE;
/*!40000 ALTER TABLE `programs_def` DISABLE KEYS */;
INSERT INTO `programs_def` VALUES (1,'cracker','',5000,3.2,'20'),(2,'hasher','',2500,3.2,'20');
/*!40000 ALTER TABLE `programs_def` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(255) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `ip` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'rodrigorhas','202cb962ac59075b964b07152d234b70','192.168.0.56'),(2,'hacebe','7815696ecbf1c96e6894b779456d330e','192.168.0.74');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-07-10 17:56:01
