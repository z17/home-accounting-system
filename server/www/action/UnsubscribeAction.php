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
        $this->db->disableEmailByUuid($this->uuid);
        $emailData = $this->db->getEmailByUuid($this->uuid);
        $page = TemplateHelper::getTemplate('page-unsubscribe');
        $page = TemplateHelper::replaceKey('email', $emailData['email'], $page);
        echo $page;
    }
}