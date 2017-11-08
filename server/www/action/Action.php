<?php
Namespace Action;

Use Base;

abstract class Action
{
    protected $db;

    protected function __construct()
    {
        $this->db = new Base();
    }

    abstract function process();
}