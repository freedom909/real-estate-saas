-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: nakano
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_notifications`
--

DROP TABLE IF EXISTS `admin_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_notifications` (
  `id` varchar(50) NOT NULL,
  `adminId` varchar(50) NOT NULL,
  `type` enum('INFO','WARNING','ERROR','SUCCESS') NOT NULL DEFAULT 'INFO',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `target` varchar(255) DEFAULT NULL,
  `targetId` varchar(50) DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_notifications`
--

LOCK TABLES `admin_notifications` WRITE;
/*!40000 ALTER TABLE `admin_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('ADMIN','SUPER_ADMIN','MODERATOR') NOT NULL DEFAULT 'ADMIN',
  `avatar` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `immutable` tinyint(1) NOT NULL DEFAULT '0',
  `lastLoginAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES ('6abca74c134bf08fdc5ec2f0','mpeg56@gmail.com','win Ukraine','SUPER_ADMIN','https://lh3.googleusercontent.com/a/ACg8ocIuVbIa6tWErIY1kfmyIP8jip1owJVqpPo2J0JvVg1SKoGy2ZTF=s96-c',1,1,NULL,'2026-09-07 18:11:25','2026-09-07 18:11:25');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `amenities`
--

DROP TABLE IF EXISTS `amenities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `amenities` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `amenities`
--

LOCK TABLES `amenities` WRITE;
/*!40000 ALTER TABLE `amenities` DISABLE KEYS */;
/*!40000 ALTER TABLE `amenities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` varchar(255) NOT NULL,
  `reservationNumber` varchar(255) DEFAULT NULL,
  `listingId` varchar(255) DEFAULT NULL,
  `customerId` varchar(255) DEFAULT NULL,
  `tenantId` varchar(255) DEFAULT NULL,
  `checkInDate` datetime DEFAULT NULL,
  `checkOutDate` datetime DEFAULT NULL,
  `price` float DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `cancelReason` varchar(255) DEFAULT NULL,
  `confirmedAt` datetime DEFAULT NULL,
  `bookingLifecycleStatus` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES ('0849ce18-e4ba-4fa0-b952-b177c5dd71ac',NULL,'7320f2a2-6966-472f-bc16-9e9430b6eb68','6abca75a134bf08fdc5ec2f1','6adf487cca02ff31ad51892e','2026-10-29 00:00:00','2026-10-30 00:00:00',3466,'CANCELLED','No reason provided',NULL,'UPCOMING','2026-10-28 04:45:39','2026-10-28 05:38:18'),('2be73da1-3e1e-41f6-b34a-5cd86838ed0e',NULL,'a785e3eb-df9d-4a23-bade-fef169e714c4','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-20 00:00:00','2026-10-27 00:00:00',209979,'PENDING',NULL,NULL,'UPCOMING','2026-10-18 11:37:22','2026-10-18 11:37:22'),('3a865139-ec54-4877-adfe-1b48c439da5f',NULL,'a785e3eb-df9d-4a23-bade-fef169e714c4','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-20 00:00:00','2026-10-21 00:00:00',29997,'PENDING',NULL,NULL,'UPCOMING','2026-10-19 03:30:58','2026-10-19 03:30:58'),('595b7d14-7cf2-4697-b8ce-9a192c335b96',NULL,'d887a0ba-47f3-47ce-92eb-c56110937a3e','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-21 00:00:00','2026-10-24 00:00:00',89991,'PENDING',NULL,NULL,'UPCOMING','2026-10-18 11:32:33','2026-10-18 11:32:33'),('5a75c5b5-47e0-47b0-b5b6-f0a0e900c2e0',NULL,'51e7630a-baeb-441c-ad73-8ce3ef48b8fc','6abca74c134bf08fdc5ec2f0','6abca74c134bf08fdc5ec2f0','2026-10-23 00:00:00','2026-10-31 00:00:00',239976,'CANCELLED','No reason provided','2026-10-21 09:32:24','UPCOMING','2026-10-21 09:31:56','2026-10-21 09:32:28'),('7cc0d97a-606b-4d06-8b3d-38d6390ed91a',NULL,'a785e3eb-df9d-4a23-bade-fef169e714c4','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-20 00:00:00','2026-10-22 00:00:00',59994,'PENDING',NULL,NULL,'UPCOMING','2026-10-18 14:02:12','2026-10-18 14:02:12'),('82f25693-60b3-4e93-ac22-c13d5efacf5b',NULL,'d887a0ba-47f3-47ce-92eb-c56110937a3e','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-15 00:00:00','2026-10-23 00:00:00',239976,'CANCELLED','No reason provided','2026-10-14 05:41:57','UPCOMING','2026-10-11 08:22:23','2026-10-14 05:46:24'),('833bd197-a075-4072-aede-21cf453038cd',NULL,'d887a0ba-47f3-47ce-92eb-c56110937a3e','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-11-01 00:00:00','2026-11-02 00:00:00',29997,'PENDING',NULL,NULL,'UPCOMING','2026-10-19 02:34:27','2026-10-19 02:34:27'),('88cc9110-a241-472b-8326-418a810dc0e3',NULL,'51e7630a-baeb-441c-ad73-8ce3ef48b8fc','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-13 00:00:00','2026-10-15 00:00:00',59994,'CONFIRMED',NULL,'2026-10-14 06:06:59','UPCOMING','2026-10-11 08:17:53','2026-10-14 06:06:59'),('a47b6c13-e259-4254-a01b-1d101f07da3c',NULL,'a785e3eb-df9d-4a23-bade-fef169e714c4','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-11-01 00:00:00','2026-11-02 00:00:00',29997,'PENDING',NULL,NULL,'UPCOMING','2026-10-19 02:38:19','2026-10-19 02:38:19'),('b3280c57-9a2e-42ec-ab41-fae3f93cba27',NULL,'51e7630a-baeb-441c-ad73-8ce3ef48b8fc','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-21 00:00:00','2026-10-24 00:00:00',89991,'PENDING',NULL,NULL,'UPCOMING','2026-10-18 11:31:13','2026-10-18 11:31:13'),('c3cc34b9-75d6-4eb5-90d4-9453f43012c0',NULL,'7320f2a2-6966-472f-bc16-9e9430b6eb68','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-31 00:00:00','2026-11-01 00:00:00',3466,'PENDING',NULL,NULL,'UPCOMING','2026-10-28 04:46:42','2026-10-28 04:46:42'),('c5bd4c63-6382-4840-a003-48bc01cf0e74',NULL,'a53ef25a-a476-4ccd-8b8c-6052d85113b0','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-29 00:00:00','2026-10-30 00:00:00',13466,'PENDING',NULL,NULL,'UPCOMING','2026-10-28 06:22:44','2026-10-28 06:22:44'),('e333f7b5-f739-4f7c-a692-f5c52d165a9f',NULL,'51e7630a-baeb-441c-ad73-8ce3ef48b8fc','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-11-06 00:00:00','2026-11-07 00:00:00',29997,'PENDING',NULL,NULL,'UPCOMING','2026-10-19 02:33:08','2026-10-19 02:33:08'),('e7202616-4663-41b5-820f-0e353748c813',NULL,'51e7630a-baeb-441c-ad73-8ce3ef48b8fc','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-20 00:00:00','2026-10-21 00:00:00',29997,'PENDING',NULL,NULL,'UPCOMING','2026-10-19 03:33:27','2026-10-19 03:33:27'),('f002af92-68b1-43a5-8965-7640bcc3d226',NULL,'d887a0ba-47f3-47ce-92eb-c56110937a3e','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-22 00:00:00','2026-10-23 00:00:00',29997,'PENDING',NULL,NULL,'UPCOMING','2026-10-19 03:42:07','2026-10-19 03:42:07');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_amenities`
--

DROP TABLE IF EXISTS `listing_amenities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_amenities` (
  `listingId` varchar(255) NOT NULL,
  `amenityId` varchar(255) NOT NULL,
  PRIMARY KEY (`listingId`,`amenityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_amenities`
--

LOCK TABLES `listing_amenities` WRITE;
/*!40000 ALTER TABLE `listing_amenities` DISABLE KEYS */;
/*!40000 ALTER TABLE `listing_amenities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_categories`
--

DROP TABLE IF EXISTS `listing_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_categories` (
  `listingId` varchar(255) NOT NULL,
  `categoryId` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`listingId`,`categoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_categories`
--

LOCK TABLES `listing_categories` WRITE;
/*!40000 ALTER TABLE `listing_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `listing_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_locations`
--

DROP TABLE IF EXISTS `listing_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_locations` (
  `listingId` varchar(255) NOT NULL,
  `locationId` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`listingId`,`locationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_locations`
--

LOCK TABLES `listing_locations` WRITE;
/*!40000 ALTER TABLE `listing_locations` DISABLE KEYS */;
/*!40000 ALTER TABLE `listing_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listings`
--

DROP TABLE IF EXISTS `listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listings` (
  `id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `ownerId` varchar(50) NOT NULL,
  `locationId` varchar(50) NOT NULL,
  `amenityIds` json DEFAULT NULL,
  `numOfBeds` int NOT NULL DEFAULT '1',
  `numOfCustomers` int NOT NULL DEFAULT '1',
  `numOfBathrooms` int NOT NULL DEFAULT '1',
  `numOfRooms` int NOT NULL DEFAULT '1',
  `pricePerNight` decimal(10,2) NOT NULL DEFAULT '1.00',
  `isFeatured` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `tenantId` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listings`
--

LOCK TABLES `listings` WRITE;
/*!40000 ALTER TABLE `listings` DISABLE KEYS */;
INSERT INTO `listings` VALUES ('2cd3ea7c-d5cc-4d20-8527-9dac58c4cf8d','a large house','it is a very large house','6abca75a134bf08fdc5ec2f1','東京都品川区大井 123 main mansion',NULL,1,2,1,1,3978.00,0,'2026-10-28 05:29:00','2026-10-28 05:29:00',NULL,'6adf487cca02ff31ad51892e'),('51e7630a-baeb-441c-ad73-8ce3ef48b8fc','good mansion you will like it','perfect experience','6abca74c134bf08fdc5ec2f0','123 main mansion',NULL,1,2,1,1,29997.00,1,'2026-10-01 15:07:44','2026-10-01 15:07:44',NULL,'6650a0000000000000000001'),('7320f2a2-6966-472f-bc16-9e9430b6eb68','beautiful house','you like it','6abca75a134bf08fdc5ec2f1','9bdc8f13-9ac5-482f-a47b-cec8245ee7f1',NULL,1,2,1,1,3466.00,0,'2026-10-28 04:44:42','2026-10-28 04:44:42',NULL,'6adf487cca02ff31ad51892e'),('a53ef25a-a476-4ccd-8b8c-6052d85113b0','a longer room you did not see','try it and give a comment','6abca75a134bf08fdc5ec2f1','ddf1f62a-0548-4529-8d64-2c59270115eb',NULL,1,2,1,1,13466.00,1,'2026-10-28 06:18:48','2026-10-28 06:18:48',NULL,'6adf487cca02ff31ad51892e'),('a785e3eb-df9d-4a23-bade-fef169e714c4','a large house','beautiful house','6abca74c134bf08fdc5ec2f0','123 main mansion',NULL,1,2,1,1,29997.00,1,'2026-10-08 13:22:08','2026-10-08 13:22:08',NULL,'6650a0000000000000000001'),('d887a0ba-47f3-47ce-92eb-c56110937a3e','a good house','everyone likes to live in this house','6abca74c134bf08fdc5ec2f0','123 main mansion',NULL,1,2,1,1,29997.00,1,'2026-10-01 06:03:34','2026-10-01 06:03:34',NULL,'6650a0000000000000000001'),('f56cc3d5-f8af-4dfe-80bb-f188144183e4','a bad room','you will hate it','6abca75a134bf08fdc5ec2f1','123 main mansion',NULL,1,2,1,1,3466.00,1,'2026-10-28 05:40:00','2026-10-28 05:40:00',NULL,'6adf487cca02ff31ad51892e');
/*!40000 ALTER TABLE `listings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `postalCode` varchar(255) NOT NULL,
  `prefecture` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `town` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES ('9ad658f6-8c70-4fb0-8a24-648d3edfd7ab','123 main mansion','1400014','東京都','品川区','大井','123 main mansion','Japan'),('9bdc8f13-9ac5-482f-a47b-cec8245ee7f1','123 main mansion','140-0014','東京都','品川区','大井','123 main mansion','Japan'),('ddf1f62a-0548-4529-8d64-2c59270115eb','123 main mansion','1400014','東京都','品川区','大井','123 main mansion','Japan');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `booking_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `customer_id` varchar(255) NOT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `check_in_date` datetime NOT NULL,
  `check_out_date` datetime NOT NULL,
  `amount` float NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `status` enum('PENDING','PROCESSING','SUCCEEDED','FAILED','REFUNDED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `cancel_reason` varchar(255) DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `refunded_at` datetime DEFAULT NULL,
  `payment_intent_id` varchar(255) DEFAULT NULL,
  `payment_provider` enum('MOCK','STRIPE','PAYPAY','SQUARE') NOT NULL DEFAULT 'MOCK',
  `transaction_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES ('065c07e9-2b10-416e-b292-a33138d960a6','833bd197-a075-4072-aede-21cf453038cd','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-11-01 00:00:00','2026-11-02 00:00:00',29997,'2026-10-19 02:34:27','2026-10-19 02:34:27','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_c6b1dda0-644d-49a4-9fc8-ddba4c0b0778'),('195b98f6-693a-4bfa-85d8-906b5b020028','f002af92-68b1-43a5-8965-7640bcc3d226','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-22 00:00:00','2026-10-23 00:00:00',29997,'2026-10-19 03:42:07','2026-10-19 03:42:07','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_4ee80c46-4b6a-4dca-a6bb-375942bd989d'),('1f78af79-ec29-4675-82c1-4632bcd3010d','c5bd4c63-6382-4840-a003-48bc01cf0e74','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-29 00:00:00','2026-10-30 00:00:00',13466,'2026-10-28 06:22:44','2026-10-28 06:22:44','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_7bc9572f-d7b5-4603-9cbe-e16aa22f0bd2'),('20cc515e-9e8b-424f-85bd-1d7f15cc8aae','88cc9110-a241-472b-8326-418a810dc0e3','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-13 00:00:00','2026-10-15 00:00:00',59994,'2026-10-14 06:07:47','2026-10-14 06:07:47','PROCESSING',NULL,'2026-10-14 06:07:47',NULL,NULL,NULL,'MOCK','mock_e1df912a-9933-43d4-87fd-f72ff1f659ee'),('3a4ae896-f0b7-46be-9a97-8f5264a9fbf7','82f25693-60b3-4e93-ac22-c13d5efacf5b','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-15 00:00:00','2026-10-23 00:00:00',239976,'2026-10-14 05:43:05','2026-10-14 05:43:05','PROCESSING',NULL,'2026-10-14 05:43:05',NULL,NULL,NULL,'MOCK','mock_f380f73a-4481-4735-9bf2-de2e583b3793'),('44246876-04d4-49be-adc6-e0814398cd83','595b7d14-7cf2-4697-b8ce-9a192c335b96','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-21 00:00:00','2026-10-24 00:00:00',89991,'2026-10-18 11:32:33','2026-10-18 11:32:33','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_cecfa254-aa9b-4758-88a6-778ba2b26029'),('4c7000ba-10a7-47f4-b39f-b1aa5ee0f968','3a865139-ec54-4877-adfe-1b48c439da5f','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-20 00:00:00','2026-10-21 00:00:00',29997,'2026-10-19 03:30:59','2026-10-19 03:30:59','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_2ca0c162-1bce-496b-a716-2755699dffe1'),('54ac232b-a397-4f71-8d30-223578415d25','b3280c57-9a2e-42ec-ab41-fae3f93cba27','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-21 00:00:00','2026-10-24 00:00:00',89991,'2026-10-18 11:31:13','2026-10-18 11:31:13','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_778aa0bd-4812-4a0a-94a7-3b1de4a26316'),('67e6041c-2ad4-4ca6-bad0-dd68d88bc907','0849ce18-e4ba-4fa0-b952-b177c5dd71ac','6abca75a134bf08fdc5ec2f1','6adf487cca02ff31ad51892e','2026-10-29 00:00:00','2026-10-30 00:00:00',3466,'2026-10-28 04:45:39','2026-10-28 04:45:39','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_e6a8cb9d-6c5a-417b-98b3-088c74a1a368'),('c7e4bc3a-8492-4c44-9ca3-0bb5d31bc6bc','a47b6c13-e259-4254-a01b-1d101f07da3c','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-11-01 00:00:00','2026-11-02 00:00:00',29997,'2026-10-19 02:38:19','2026-10-19 02:38:19','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_c2363ca8-2e15-436b-832d-467fc760eac0'),('c9758014-cec1-4aac-a9de-b4c5897f88dc','5a75c5b5-47e0-47b0-b5b6-f0a0e900c2e0','6abca74c134bf08fdc5ec2f0','6abca74c134bf08fdc5ec2f0','2026-10-23 00:00:00','2026-10-31 00:00:00',239976,'2026-10-21 09:31:56','2026-10-21 09:31:56','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_c410cbbd-4409-4bc2-aa37-42f8827f863b'),('caf84404-4987-4733-84b1-9d7797476d3a','c3cc34b9-75d6-4eb5-90d4-9453f43012c0','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-31 00:00:00','2026-11-01 00:00:00',3466,'2026-10-28 04:46:42','2026-10-28 04:46:42','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_37cc0335-098d-4db8-a99a-dfb0dbe36e27'),('e2974ac9-f95e-4a4e-9cf3-d2753f083e4f','e333f7b5-f739-4f7c-a692-f5c52d165a9f','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-11-06 00:00:00','2026-11-07 00:00:00',29997,'2026-10-19 02:33:08','2026-10-19 02:33:08','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_56e27abc-4036-4639-b39c-5d47de71a9bb'),('e742bec1-65f3-46d1-bbdb-f8ba0119a163','e7202616-4663-41b5-820f-0e353748c813','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-20 00:00:00','2026-10-21 00:00:00',29997,'2026-10-19 03:33:27','2026-10-19 03:33:27','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_9eca23e0-da07-490c-96a4-81c73709bd32'),('eb6c7857-60bd-4283-8304-55d0fb82f0d8','2be73da1-3e1e-41f6-b34a-5cd86838ed0e','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-20 00:00:00','2026-10-27 00:00:00',209979,'2026-10-18 11:37:22','2026-10-18 11:37:22','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_4728e21e-be56-4fed-b2d4-8d7d7552d091'),('fce5c6ca-1fa0-462b-9dd9-f66a85bb3d98','7cc0d97a-606b-4d06-8b3d-38d6390ed91a','6abcb0a11b7ee6739d01064d','6abcb0a11b7ee6739d01064d','2026-10-20 00:00:00','2026-10-22 00:00:00',59994,'2026-10-18 14:02:12','2026-10-18 14:02:12','PENDING',NULL,NULL,NULL,NULL,NULL,'MOCK','mock_9d86458f-f640-492f-a610-ca05010587f4');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pictures`
--

DROP TABLE IF EXISTS `pictures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pictures` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `listingId` varchar(50) NOT NULL,
  `objectKey` varchar(255) NOT NULL,
  `mimeType` varchar(255) NOT NULL,
  `size` int NOT NULL DEFAULT '0',
  `type` varchar(255) NOT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `listingId` (`listingId`),
  CONSTRAINT `pictures_ibfk_1` FOREIGN KEY (`listingId`) REFERENCES `listings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pictures`
--

LOCK TABLES `pictures` WRITE;
/*!40000 ALTER TABLE `pictures` DISABLE KEYS */;
INSERT INTO `pictures` VALUES ('0946d944-4749-40c7-a09d-ca3af2765b27','51e7630a-baeb-441c-ad73-8ce3ef48b8fc','listings/51e7630a-baeb-441c-ad73-8ce3ef48b8fc/9549b09d-d101-4275-8d0e-e55cc09fdbb4.jpg','image/jpeg',17689,'listing',1,'2026-10-01 15:07:44','2026-10-01 15:07:44'),('135aff47-9bf9-452e-92de-1781849cedf4','7320f2a2-6966-472f-bc16-9e9430b6eb68','listings/7320f2a2-6966-472f-bc16-9e9430b6eb68/d99186f2-c3d8-4fd8-86e4-6233b40d55a6.jpg','image/jpeg',28108,'listing',0,'2026-10-28 04:44:42','2026-10-28 04:44:42'),('17d363f5-0aab-434b-8eaf-ddeb8ab2f2b7','f56cc3d5-f8af-4dfe-80bb-f188144183e4','listings/f56cc3d5-f8af-4dfe-80bb-f188144183e4/ef9f773d-912a-44e8-9774-d8316ac5eac3.jpg','image/jpeg',28108,'listing',1,'2026-10-28 05:40:00','2026-10-28 05:40:00'),('243f1e9e-0c47-4781-b7c9-200d4265705e','2cd3ea7c-d5cc-4d20-8527-9dac58c4cf8d','listings/2cd3ea7c-d5cc-4d20-8527-9dac58c4cf8d/6a2f1229-1845-48da-bc43-3837e6646470.jpg','image/jpeg',6101,'listing',0,'2026-10-28 05:29:00','2026-10-28 05:29:00'),('49f7ec89-569a-49d5-8655-014778b705b6','a785e3eb-df9d-4a23-bade-fef169e714c4','listings/a785e3eb-df9d-4a23-bade-fef169e714c4/35e3739f-d461-47c5-ac92-8c7191c096cb.jpg','image/jpeg',6101,'listing',0,'2026-10-08 13:22:08','2026-10-08 13:22:08'),('5324c23c-372f-47a7-931b-c4c98aa95781','a785e3eb-df9d-4a23-bade-fef169e714c4','listings/a785e3eb-df9d-4a23-bade-fef169e714c4/ced97ca3-e8e7-4789-8158-8e3121c7a14a.jpg','image/jpeg',13329,'listing',1,'2026-10-08 13:22:08','2026-10-08 13:22:08'),('82ce1e98-e8c4-4fdf-95fb-5484835d4636','a53ef25a-a476-4ccd-8b8c-6052d85113b0','listings/a53ef25a-a476-4ccd-8b8c-6052d85113b0/10728c76-acb4-4406-be1e-235bb7d6a575.jpg','image/jpeg',28108,'listing',0,'2026-10-28 06:18:48','2026-10-28 06:18:48'),('8c5e081f-5700-4cb1-8608-c94925367254','51e7630a-baeb-441c-ad73-8ce3ef48b8fc','listings/51e7630a-baeb-441c-ad73-8ce3ef48b8fc/8036d12d-cf18-4869-8a44-8fa91081bfdc.jpg','image/jpeg',28108,'listing',2,'2026-10-01 15:07:44','2026-10-01 15:07:44'),('c9a97c29-08f9-4317-bbf0-23d6b47a8233','d887a0ba-47f3-47ce-92eb-c56110937a3e','listings/d887a0ba-47f3-47ce-92eb-c56110937a3e/96acb95c-5759-4c73-a769-0b301ddd7d16.jpg','image/jpeg',28108,'listing',0,'2026-10-01 06:03:34','2026-10-01 06:03:34'),('caead896-aa2d-4cb1-8a5f-c64b76fb3f15','2cd3ea7c-d5cc-4d20-8527-9dac58c4cf8d','listings/2cd3ea7c-d5cc-4d20-8527-9dac58c4cf8d/90a9920a-427c-4ea9-9a65-625c16ad504b.jpg','image/jpeg',13329,'listing',1,'2026-10-28 05:29:00','2026-10-28 05:29:00'),('cc8e0b7a-f3ee-454c-a2c3-896756e5c888','f56cc3d5-f8af-4dfe-80bb-f188144183e4','listings/f56cc3d5-f8af-4dfe-80bb-f188144183e4/e4261fde-c5da-4558-b760-a63b0b98efa5.jpg','image/jpeg',17689,'listing',0,'2026-10-28 05:40:00','2026-10-28 05:40:00'),('ccdb4bae-a117-4608-987e-7c2c770b365a','f56cc3d5-f8af-4dfe-80bb-f188144183e4','listings/f56cc3d5-f8af-4dfe-80bb-f188144183e4/b5db74c0-1696-4bbc-8882-a5e344cd8312.jpg','image/jpeg',28108,'listing',2,'2026-10-28 05:40:00','2026-10-28 05:40:00'),('e1d46519-ff33-4369-884a-ddf7ec38f262','51e7630a-baeb-441c-ad73-8ce3ef48b8fc','listings/51e7630a-baeb-441c-ad73-8ce3ef48b8fc/b711040c-da0d-44dd-9f79-481b963296d6.jpg','image/jpeg',8148,'listing',0,'2026-10-01 15:07:44','2026-10-01 15:07:44'),('e21c93a8-14b9-474d-bdba-2e562156804c','d887a0ba-47f3-47ce-92eb-c56110937a3e','listings/d887a0ba-47f3-47ce-92eb-c56110937a3e/9de64342-ef8b-47c3-8637-01463187b49f.jpg','image/jpeg',28108,'listing',1,'2026-10-01 06:03:34','2026-10-01 06:03:34'),('ffc49784-818e-4c06-b416-af8bc3d4dd7a','7320f2a2-6966-472f-bc16-9e9430b6eb68','listings/7320f2a2-6966-472f-bc16-9e9430b6eb68/9080e933-54da-4a33-8801-fd5accd75c4c.jpg','image/jpeg',28108,'listing',1,'2026-10-28 04:44:42','2026-10-28 04:44:42');
/*!40000 ALTER TABLE `pictures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` varchar(50) NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'general',
  `description` varchar(255) DEFAULT NULL,
  `updatedBy` varchar(50) DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-28 17:03:37
