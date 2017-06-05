<?php

class Base
{
    private $base;
    private $host;
    private $baseName;
    private $user;
    private $password;

    public function __construct()
    {
        $this->base = new PDO("mysql:host=" . Config::$host . ";dbname=" . Config::$db_name, Config::$db_user, Config::$db_password);
        $this->base->query("set names utf8");
    }

    public function addEmail($email)
    {
        $query = "
            INSERT INTO emails (uuid, email, deleted) VALUES (:uuid, :email, true)";
        $sql = $this->base->prepare($query);
        $sql->bindParam(':uuid', uniqid());
        $sql->bindParam(':email', $email);
        $fl = $sql->execute();
    }

    public function updateEmail($newEmail, $oldEmail)
    {
        $query = "
		UPDATE emails
		SET
			email = :new_email
		WHERE 
			email = :old_email";
        $sql = $this->base->prepare($query);
        $sql->bindParam(':new_email', $newEmail);
        $sql->bindParam(':old_email', $oldEmail);
        $sql->execute();
    }

    public function enableEmail($email)
    {
        $query = "
		UPDATE emails
		SET
			deleted = false
		WHERE 
			email = :email";
        $sql = $this->base->prepare($query);
        $sql->bindParam(':email', $email);
        $sql->execute();
    }

    public function disableEmail($email)
    {
        $query = "
		UPDATE emails
		SET
			deleted = true
		WHERE 
			email = :email";
        $sql = $this->base->prepare($query);
        $sql->bindParam(':email', $email);
        $sql->execute();
    }

    public function disableEmailByUuid($uuid)
    {
        $query = "
		UPDATE emails
		SET
			deleted = true
		WHERE 
			uuid = :uuid";
        $sql = $this->base->prepare($query);
        $sql->bindParam(':uuid', $uuid);
        $sql->execute();
    }

    public function emailExists($email)
    {
        $query = "SELECT COUNT(email) as count FROM  emails WHERE email = :email";
        $sql = $this->base->prepare($query);
        $sql->bindParam(':email', $email);
        $sql->execute();
        $result = $sql->fetchObject();
        return $result->count > 0;
    }

    public function getActiveEmails() {
        $query = "SELECT email FROM emails WHERE deleted = false";
        $sql -> execute();
        return  $sql -> fetchAll(PDO::FETCH_ASSOC);
    }
}