<?php
namespace Cromberg\Models;

class CurrencyRate {
	public $id;
	public $date;
	public $value;
	public $code;

    public function __construct(int $id, string $date, int $value, int $code) {
    	$this->id = $id;
    	$this->date = $date;
    	$this->value = $value;
    	$this->code = $code;
    }

}
