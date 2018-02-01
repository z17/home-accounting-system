<?php
Namespace Cromberg\Action;

use Cromberg\Config;

class NotifyAction extends Action
{
    private $key;

    public function __construct($key)
    {
        parent::__construct();
        $this->key = $key;
    }

    public function process()
    {
        if ($this->key !== Config::$notify_key) {
            echo "invalid key";
            return;
        }

        if (date('t') !== date('d')) {
            echo "today isn't last day of month";
            return;
        }

        $this->db->fillNotificationTable();
    }
}