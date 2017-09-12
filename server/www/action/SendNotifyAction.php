<?php

class SendNotifyAction extends Action
{
    public function __construct()
    {
        parent::__construct();
    }

    function process()
    {
        $emailsData = $this->db->getNotifyEmailsList(Config::$notify_count);
        foreach ($emailsData as $data) {
            $this->sendEmail($data['email'], $data['uuid']);
            $this->db->markAsCompleted($data['id']);
        }
    }

    private function sendEmail($email, $uuid)
    {
        $unsubscribeLink = Config::$domain_url . '/unsubscribe?uuid=' . $uuid;

        $subject = 'Напоминание от Cromberg';
        $message = TemplateHelper::getTemplate('email-notification');
        $message = TemplateHelper::replaceKey('unsubscribe_link', $unsubscribeLink, $message);
        $headers = 'From: noreply@' . Config::$domain_url . "\r\n" .
            'Reply-To: noreply@' . Config::$domain_url . "\r\n" .
            'X-Mailer: Cromberg mailer' . "\r\n" .
            'List-Unsubscribe: <' . $unsubscribeLink . '>';

        mail($email, $subject, $message, $headers);
    }
}