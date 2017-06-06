<?php

class NotifyAction extends Action
{
    public function __construct()
    {
        parent::__construct();
    }

    public function process()
    {
        $this->db->fillNotificationTable();
    }
}