CREATE TABLE IF NOT EXISTS `emails` (
  uuid    VARCHAR(25)        NOT NULL,
  email   VARCHAR(255) UNIQUE NOT NULL,
  deleted BOOLEAN             NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`uuid`)
)
  ENGINE = InnoDB
  DEFAULT CHARSET = utf8;


CREATE TABLE IF NOT EXISTS `reminders` (
  id         INT(11)      NOT NULL AUTO_INCREMENT,
  email_uuid VARCHAR(25) NOT NULL,
  done BOOLEAN NOT NULL  DEFAULT FALSE,
  PRIMARY KEY (`id`),
  FOREIGN KEY (email_uuid)
  REFERENCES emails(uuid)
)
  ENGINE = InnoDB
  DEFAULT CHARSET = utf8;