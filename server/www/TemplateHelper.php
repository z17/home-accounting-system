<?php

class TemplateHelper
{

    public static function getTemplate($name)
    {
        $html = file_get_contents(self::getPathToTemplate($name));
        return self::replaceKey('domain_url', Config::$domain_url, $html);
    }

    public static function getPageTemplate($name, $title) {
        $template = file_get_contents(self::getPathToTemplate(Template::MAIN));
        $content = self::getTemplate($name);
        $content = self::replaceKey('body', $content, $template);
        $content = self::replaceKey('title', $title, $content);
        return $content;
    }

    public static function replaceKey($key, $value, $data)
    {
        return str_replace('[[' . $key . ']]', $value, $data);
    }

    private static function getPathToTemplate($name) {
        return Template::TEMPLATE_ROOT . $name . '.html';
    }
}