<?php

class EmailAction extends Action
{
    private $data;

    public function __construct($data)
    {
        parent::__construct();
        $this->data = $data;
    }

    public function process()
    {

        switch ($data['action']) {
            case 'add':
                $email = $data['email'];
                if ($this->db->emailExists($email)) {
                    $this->db->enableEmail($email);
                } else {
                    $this->db->addEmail($email);
                }
                break;
            case 'update' :
                $this->db->updateEmail($data['email'], $data['oldEmail']);
                break;
            case 'delete':
                $this->db->disableEmail($data['email']);
                break;
            default:
                // todo: log this
        }
    }
}