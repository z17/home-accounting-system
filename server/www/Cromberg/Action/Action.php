<?php
Namespace Cromberg\Action;

Use Cromberg\Base;

abstract class Action
{
    protected $db;

    protected function __construct()
    {
        $this->db = new Base();
    }

    abstract function process();
}