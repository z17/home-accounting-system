<?php

class UnsubscribeAction extends Action
{
    private $uuid;

    public function __construct($uuid)
    {
        parent::__construct();
        $this->uuid = $uuid;
    }

    public function process()
    {
        $this->db->disableEmailByUuid($this -> uuid);
    }
}