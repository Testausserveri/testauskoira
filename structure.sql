# testausserveri/testauskoira@11b51d3
# Generation Time: 2021-10-06 08:05:09 +0000
# Host: (MySQL 5.5.5-10.5.8-MariaDB-1:10.5.8+maria~bionic)

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table blocks
# ------------------------------------------------------------

CREATE TABLE `blocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from` text DEFAULT NULL,
  `mailbox` text DEFAULT NULL,
  `sub` text DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `from_mailbox_sub` (`from`,`mailbox`,`sub`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table mailboxes
# ------------------------------------------------------------

CREATE TABLE `mailboxes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mailbox` text DEFAULT NULL,
  `userid` text NOT NULL,
  `key` text NOT NULL,
  `lastUpdated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `mailbox` (`mailbox`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table messages_day_stat
# ------------------------------------------------------------

CREATE TABLE `messages_day_stat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `userid` text DEFAULT NULL,
  `message_count` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userid` (`userid`,`date`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
