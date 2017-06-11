<?php

require_once 'Config.php';
require_once 'functions.php';
require_once 'Base.php';
require_once 'action/Action.php';
require_once 'action/EmailAction.php';
require_once 'action/NotifyAction.php';

$path = $_SERVER["REDIRECT_URL"];

switch ($path) {
    case '/email':
        $data = isset($_POST['data']) ?  json_decode($_POST['data']) : null;
        $action = new EmailAction($data);
        $action->process();
        break;
    case '/notify':
        $key = isset($_GET['key']) ? $_GET['key'] : null;
        $action = new NotifyAction($key);
        $action->process();
        break;
    case '/send-notify':
        // todo: send some emails
        break;
    default:
        break;
}
