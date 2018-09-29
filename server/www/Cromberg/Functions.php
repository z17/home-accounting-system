<?php

namespace Cromberg;

class Functions
{
    public static function writeLog($string)
    {
        $log = date('d.m.Y H:i:s') . ": " . $string . "\n";
        file_put_contents(Config::$log_file, $log . "\n", FILE_APPEND);
    }

    public static function writeObjectToLog($object)
    {
        ob_start();
        var_dump($object);
        $string = ob_get_clean();
        self::writeLog($string);
    }

    public static function redirect($page)
    {
        header('Location: ' . $page);
        die();
    }
}
