<?php
Namespace Cromberg\Action;

use Cromberg\Functions;
use Cromberg\Lang;

class SettingsAction extends Action
{
    private $data;

    public function __construct($data)
    {
        parent::__construct();
        $this->data = $data;
    }

    public function process()
    {
        if (!isset($this->data)) {
            Functions::writeLog("invalid request with email");
            return;
        }

        $lang = Lang::DEFAULT_LANG;
        if (isset($this->data->language) && in_array($lang, Lang::SUPPORTED_LANGUAGES)) {
            $lang = $this->data->language;
        }
        switch ($this->data->action) {
            case 'add':
                $email = $this->data->email;
                if ($this->db->emailExists($email)) {
                    $this->db->enableEmail($email, $lang);
                } else {
                    $this->db->addEmail($email, $lang);
                }
                break;
            case 'update' :
                $this->db->updateEmail($this->data->email, $this->data->oldEmail, $lang);
                break;
            case 'delete':
                $this->db->disableEmail($this->data->email, $lang);
                break;
            default:
                Functions::writeLog("invalid action with email");
        }
    }
}