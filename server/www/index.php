<?php

require_once 'Config.php';
require_once 'functions.php';
require_once 'Base.php';
require_once 'TemplateHelper.php';
require_once 'Template.php';
require_once 'action/Action.php';
require_once 'action/EmailAction.php';
require_once 'action/NotifyAction.php';
require_once 'action/SendNotifyAction.php';
require_once 'action/UnsubscribeAction.php';
require_once 'action/VersionAction.php';

$path = isset($_SERVER["REDIRECT_URL"]) ? $_SERVER["REDIRECT_URL"] : '';
switch ($path) {
    case '/email':
        $data = isset($_POST['data']) ? json_decode($_POST['data']) : null;
        $action = new EmailAction($data);
        $action->process();
        break;
    case '/notify':
        $key = isset($_GET['key']) ? $_GET['key'] : null;
        $action = new NotifyAction($key);
        $action->process();
        break;
    case '/send-notify':
        $action = new SendNotifyAction();
        $action->process();
        break;
    case '/unsubscribe':
        $uuid = isset($_GET['uuid']) ? $_GET['uuid'] : null;
        $action = new UnsubscribeAction($uuid);
        $action->process();
        break;
    case '/version':
        $action = new VersionAction();
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
        writeLog("404 error: ". $path);
        break;
}
