<?php
Namespace Cromberg\Action;

Use Cromberg\TemplateHelper;
Use Cromberg\Template;

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
        $page = TemplateHelper::getPageTemplate(Template::PAGE_UNSUBSCRIBE, 'Отписаться');
        $page = TemplateHelper::replaceKey('email', $emailData['email'], $page);
        echo $page;
    }
}