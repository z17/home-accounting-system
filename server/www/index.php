<?php

use Cromberg\Functions;
use Cromberg\Template;
use Cromberg\TemplateHelper;
use Cromberg\Action;

spl_autoload_register(function ($name) {
    $fileParts = explode('\\', $name);
    array_walk($fileParts, function (&$str, $i, $size) {
        if ($i == $size - 1) {
            return;
        }
        $str = strtolower($str);
    }, count($fileParts));
    $filePath = implode('/', $fileParts) . '.php';
    /** @noinspection PhpIncludeInspection */
    require_once $filePath;
});

$path = isset($_SERVER["REDIRECT_URL"]) ? $_SERVER["REDIRECT_URL"] : '';
switch ($path) {
    case '/email':
        $data = isset($_POST['data']) ? json_decode($_POST['data']) : null;
        $action = new Action\SettingsAction($data);
        $action->process();
        break;
    case '/notify':
        $key = isset($_GET['key']) ? $_GET['key'] : null;
        $action = new Action\NotifyAction($key);
        $action->process();
        break;
    case '/send-notify':
        $action = new Action\SendNotifyAction();
        $action->process();
        break;
    case '/unsubscribe':
        $uuid = isset($_GET['uuid']) ? $_GET['uuid'] : null;
        $action = new Action\UnsubscribeAction($uuid);
        $action->process();
        break;
    case '/version':
        $action = new Action\VersionAction();
        $action->process();
        break;
    case '';
        // todo: transfer this from index.php
        echo TemplateHelper::getPageTemplate(Template::PAGE_INDEX, 'Cromberg');
        break;
    default:
        // todo: transfer this from index.php
        header("HTTP/1.0 404 Not Found");
        echo TemplateHelper::getPageTemplate(Template::PAGE_404, '404 error');
        Functions::writeLog("404 error: " . $path);
        break;
}
