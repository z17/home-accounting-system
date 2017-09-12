<?php

class TemplateHelper
{
    private static $templateRoot = __DIR__ . '/resources/template/';

    public static function getTemplate($name)
    {
        $html = file_get_contents(self::$templateRoot . $name . '.html');
        return self::replaceKey('domain_url', Config::$domain_url, $html);
    }

    public static function replaceKey($key, $value, $data)
    {
        return str_replace('[[' . $key . ']]', $value, $data);
    }

}