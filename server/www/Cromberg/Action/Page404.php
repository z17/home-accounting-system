<?php
Namespace Cromberg\Action;

use Cromberg\Functions;
Use Cromberg\TemplateHelper;
Use Cromberg\Template;

class Page404 extends Action
{
    private $path;
    public function __construct($path)
    {
        parent::__construct();
        $this->path = $path;
    }

    public function process()
    {
        header("HTTP/1.0 404 Not Found");
        echo TemplateHelper::getPageTemplate(Template::PAGE_404, '404 error');
        Functions::writeLog("404 error: " . $this->path);
    }
}
