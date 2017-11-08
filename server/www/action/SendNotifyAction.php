<?php
Namespace Action;

Use Config;
Use TemplateHelper;
Use Template;

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
        $unsubscribeLink = Config::$domain_link . '/unsubscribe?uuid=' . $uuid;

        $subject = 'Напоминание от Cromberg';
        $message = TemplateHelper::getTemplate(Template::EMAIL_NOTIFICATION);
        $message = TemplateHelper::replaceKey('unsubscribe_link', $unsubscribeLink, $message);
        $headers = 'From: noreply@' . Config::$domain . "\r\n" .
            'Reply-To: noreply@' . Config::$domain . "\r\n" .
            'X-Mailer: Cromberg mailer' . "\r\n" .
            'List-Unsubscribe: <' . $unsubscribeLink . '>' . "\r\n" .
            'Content-type: text/html; charset=utf-8' . "\r\n";

        mail($email, $subject, $message, $headers);
    }
}