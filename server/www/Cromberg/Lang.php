<?php

namespace Cromberg;

class Lang
{
    const DEFAULT_LANG = 'en';
    const SUPPORTED_LANGUAGES = ['en', 'ru', 'fr'];

    public static function get($key, $lang)
    {
        $data = self::getData();

        if (isset($data[$key][$lang])) {
            return $data[$key][$lang];
        }
        if (isset($data[$key][self::DEFAULT_LANG])) {
            return $data[$key][self::DEFAULT_LANG];
        }

        return $key;
    }

    public static function getPrepared($key, $lang, $replaceArray = array())
    {
        $string = self::get($key, $lang);
        $i = 1;
        foreach ($replaceArray as $replace) {
            $search = '$' . $i++;
            $string = TemplateHelper::replaceKey($search, $replace, $string);
        }
        return $string;
    }

    private static function getData()
    {
        return [
            'subject' => [
                'en' => 'Notification from Cromberg',
                'ru' => 'Напоминание от Cromberg'
            ],
            'main-caption' => [
                'en' => 'Notification',
                'ru' => 'Заголовок',
            ],
            'text' => [
                'en' => 'It\'s already last day of the month, it\'s time to fill the current balance data in the Cromberg',
                'ru' => ' Уже конец месяца, пришло время заполнить текущий баланс в системе Cromberg.',
            ],
            'cause' => [
                'en' => 'You have received this email because you use <a href="[[$1]]" title="Cromberg - home accounting system">Cromberg</a> app and subscribed for monthly notifications. To unsubscribe, just change settings in the app.
            If you don\'t understand what is it, you can unsubscribe from letters by clicking on <a href="[[$2]]">this</a> link.',
                'ru' => 'Вы получили это письмо так как пользуетесь <a href="[[$1]]" title="Cromberg - домашняя система учёта финансов">Cromberg</a> и подписались на ежемесячные уведомления. Чтобы отписаться, измените соответствующие настройки в приложении.
            Если вы не понимаете о чём речь, отпишитесь от сообщений нажав на эту <a href="[[$2]]">ссылку</a>.',
            ],
        ];
    }
}