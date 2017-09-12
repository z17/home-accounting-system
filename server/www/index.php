<?php

require_once 'Config.php';
require_once 'functions.php';
require_once 'Base.php';
require_once 'TemplateHelper.php';
require_once 'action/Action.php';
require_once 'action/EmailAction.php';
require_once 'action/NotifyAction.php';
require_once 'action/SendNotifyAction.php';
require_once 'action/UnsubscribeAction.php';

$path = $_SERVER["PATH_INFO"];

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
    case '/';
        // todo: show page-index.html
        break;
    default:
        // todo: show page-404.html
        break;
}
