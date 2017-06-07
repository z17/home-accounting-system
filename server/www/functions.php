<?php

function writeLog($string) {
    $log = date('d.m.Y H:i:s') . ": " . $string . "\n";
    file_put_contents(Config::$log_file, $log . "\n", FILE_APPEND);
}