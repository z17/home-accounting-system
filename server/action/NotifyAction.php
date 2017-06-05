<?php

class NotifyAction extends Action
{
    public function __construct()
    {
        parent::__construct();
    }

    public function process()
    {
        $emails = $this->db->getActiveEmails();

        foreach ($emails as $email) {
            // sendEmail
        }
    }
}