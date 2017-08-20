<?php

class SendNotifyAction extends Action
{
    public function __construct()
    {
        parent::__construct();
    }

    function process()
    {
        $emails = $this->db->getNotifyEmailsList(Config::$notify_count);
        foreach($emails as $email) {
            $this->sendEmail($email['email']);
            $this->db->markAsCompleted($email['id']);
        }
    }

    private function sendEmail($email) {
        var_dump("send email to " . $email);
    }
}