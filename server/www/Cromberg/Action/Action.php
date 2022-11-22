<?php
Namespace Cromberg\Action;

Use Cromberg\Base;
use Cromberg\Functions;
Use Cromberg\TemplateHelper;
Use Cromberg\Template;

abstract class Action
{
    protected $db;

    protected function __construct()
    {
        $this->db = new Base();
    }

    abstract function process();

    public function error(?string $message) {
        $message = $message ? $message : '500 error';
        header("HTTP/1.0 500 Internal Server Error");
        echo TemplateHelper::getPageTemplate(Template::PAGE_500, $message);
        Functions::writeLog("500 error: " . $message . ' ' . static::class);
        exit();
    }

    public function json($data) {
        echo json_encode($data);
        exit();
    }
    public function jsonError($message) {
        header("HTTP/1.0 500 Internal Server Error");
        echo json_encode(['status' => false, 'message' => $message]);
        exit();
    }
}
