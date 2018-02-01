<?php
Namespace Cromberg\Action;

class VersionAction extends Action
{
    const VERSION_FILE = '../../app/package.json';

    public function __construct()
    {
        parent::__construct();
    }

    function process()
    {
        $data = file_get_contents(self::VERSION_FILE);
        $version = json_decode($data)->version;

        $this->db->logVersionRequest($_SERVER['REMOTE_ADDR']);
        echo json_encode(
            [
                'data' => $version
            ]
        );
    }
}