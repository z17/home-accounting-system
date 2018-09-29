<?php

use Cromberg\Action;
use Cromberg\Urls;

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
    case Urls::EMAIL:
        $data = isset($_POST['data']) ? json_decode($_POST['data']) : null;
        $action = new Action\SettingsAction($data);
        $action->process();
        break;
    case Urls::NOTIFY:
        $key = isset($_GET['key']) ? $_GET['key'] : null;
        $action = new Action\NotifyAction($key);
        $action->process();
        break;
    case Urls::SEND_NOTIFY:
        $action = new Action\SendNotifyAction();
        $action->process();
        break;
    case Urls::UNSUBSCRIBE:
        $uuid = isset($_GET['uuid']) ? $_GET['uuid'] : null;
        $action = new Action\UnsubscribeAction($uuid);
        $action->process();
        break;
    case Urls::VERSION:
        $action = new Action\VersionAction();
        $action->process();
        break;
    case Urls::STATS;
        $code = isset($_GET['code']) ? $_GET['code'] : null;
        $action = new Action\StatsAction($code);
        $action->process();
        break;
    case Urls::MAIN;
        $action = new Action\MainAction();
        $action->process();
        break;
    default:
        $action = new Action\Page404($path);
        $action->process();
        break;
}

