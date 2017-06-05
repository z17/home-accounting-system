<?php

require_once 'Config.php';
require_once 'Base.php';
require_once 'action/Action.php';
require_once 'action/EmailAction.php';
require_once 'action/NotifyAction.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    exit;
}

$path = ''; // url of request

switch ($path) {
    case '/email':
        $data = json_decode($_POST['data']);
        $action = new EmailAction($data);
        $action->process();
        break;
    case '/notify':
        $action = new NotifyAction($data);
        $action->process();
        break;
    default:
        echo "unknown path";
        break;
}