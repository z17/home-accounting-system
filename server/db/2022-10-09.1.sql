CREATE TABLE IF NOT EXISTS `currency_rate`
(
    `id`            INT(11)  NOT NULL AUTO_INCREMENT,
    `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date`          DATE     NOT NULL,
    `code`          INT(11)  NOT NULL,
    `value`         INT(11)  NOT NULL,
    PRIMARY KEY (`id`),
    INDEX (`date`)
)
    ENGINE = InnoDB
    DEFAULT CHARSET = utf8;
