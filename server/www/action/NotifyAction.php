<?php

class NotifyAction extends Action
{
    private $key;

    public function __construct($key)
    {
        parent::__construct();
        $this -> key = $key;
    }

    public function process()
    {
        if ($this -> key !== Config::$notify_key) {
            echo "invalid key";
            return;
        }

        $this->db->fillNotificationTable();
    }
}