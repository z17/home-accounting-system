<?php

namespace Cromberg;

class TemplateHelper
{

    public static function getTemplate($name)
    {
        return file_get_contents(self::getPathToTemplate($name));
    }

    public static function getPageTemplate($name, $title)
    {
        $template = file_get_contents(self::getPathToTemplate(Template::MAIN));
        $content = self::getTemplate($name);
        $content = self::replaceKey('body', $content, $template);
        $content = self::replaceKey('title', $title, $content);
        $content = self::replaceKey('domain_url', Config::$domain_link, $content);
        return $content;
    }

    public static function replaceKey($key, $value, $data)
    {
        return str_replace('[[' . $key . ']]', $value, $data);
    }

    private static function getPathToTemplate($name)
    {
        return Template::TEMPLATE_ROOT . $name . '.html';
    }
}