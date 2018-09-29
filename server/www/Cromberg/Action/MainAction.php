<?php
Namespace Cromberg\Action;

Use Cromberg\TemplateHelper;
Use Cromberg\Template;

class MainAction extends Action
{
    public function __construct()
    {
        parent::__construct();
    }

    public function process()
    {
        echo TemplateHelper::getPageTemplate(Template::PAGE_INDEX, 'Cromberg');
    }
}
