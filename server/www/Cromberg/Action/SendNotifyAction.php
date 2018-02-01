<?php

Namespace Cromberg\Action;

Use Cromberg\Config;
use Cromberg\Lang;
Use Cromberg\TemplateHelper;
Use Cromberg\Template;

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
            $this->sendEmail($data['email'], $data['lang'], $data['uuid']);
            $this->db->markAsCompleted($data['id']);
        }
    }

    private function sendEmail($email, $lang, $uuid)
    {
        $unsubscribeLink = Config::$domain_link . '/unsubscribe?uuid=' . $uuid;

        $subject = Lang::get('subject', $lang);
        $message = TemplateHelper::getTemplate(Template::EMAIL_NOTIFICATION);
        $message = TemplateHelper::replaceKey('unsubscribe_link', $unsubscribeLink, $message);
        $message = TemplateHelper::replaceKey('main-caption', Lang::get('main-caption', $lang), $message);
        $message = TemplateHelper::replaceKey('text', Lang::get('text', $lang), $message);
        $message = TemplateHelper::replaceKey('cause', Lang::getPrepared('cause', $lang, [Config::$domain_link, $unsubscribeLink]), $message);
        $headers = 'From: noreply@' . Config::$domain . "\r\n" .
            'Reply-To: noreply@' . Config::$domain . "\r\n" .
            'X-Mailer: Cromberg mailer' . "\r\n" .
            'List-Unsubscribe: <' . $unsubscribeLink . '>' . "\r\n" .
            'Content-type: text/html; charset=utf-8' . "\r\n";

        mail($email, $subject, $message, $headers);
    }
}