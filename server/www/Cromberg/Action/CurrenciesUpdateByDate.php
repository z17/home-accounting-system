<?php
Namespace Cromberg\Action;

use Cromberg\Currency;

class CurrenciesUpdateByDate extends Action {
    private $time = null;

    public function __construct(?string $date) {
        parent::__construct();

        if (!$date) {
           $time = time(); // today
        } else {
            $time = strtotime($date);
        }
        $this->time = $time;
    }

    function process() {
        $date_string = date('Y-m-d', $this->time);

        $rates_by_date = $this->db->getCurrenciesByDate($date_string);
        if (!empty($rates_by_date)) {
            $this->error('Already filled');
        }

        $data = file_get_contents('https://api.exchangerate.host/'.$date_string.'?base=USD');
        $parsed_data = json_decode($data);
        $base = $parsed_data->base;
        if ($base != Currency::BASE_CURRENCY) {
            $this->error('Wrong base');
            return;
        }

        $rates = $parsed_data->rates;
        foreach ($rates as $rate_code => $value) {
            if  (!Currency::isAllowed($rate_code)) {
                continue;
            }
            if ($rate_code == Currency::BASE_CURRENCY) {
                continue;
            }
            $currency = Currency::createCurrency($rate_code, date('Y-m-d', $this->time), $value);
            $this->db->insertCurrency($currency);
        }
    }
}
