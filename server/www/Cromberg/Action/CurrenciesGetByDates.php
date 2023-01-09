<?php
Namespace Cromberg\Action;

use Cromberg\Currency\Currency;

class CurrenciesGetByDates extends Action {
    private $dates;

    const LIMIT_DATES_COUNT = 500;

    public function __construct($decoded_data) {
        parent::__construct();

        $this->dates = [];
        if ($decoded_data and $decoded_data['dates'] and is_array($decoded_data['dates'])) {
            $this->dates = array_slice($decoded_data['dates'], 0, CurrenciesGetByDates::LIMIT_DATES_COUNT);
        }
    }

    function process() {
        $dates = array_filter($this->dates, function($date) {
            return (bool)strtotime($date);
        });

        if (!$dates) {
            $this->json([]);
        }

        $currencies = $this->db->getCurrenciesByDates($dates);
        $currencies_by_date = [];

        foreach($currencies as $currency) {
            if (!isset($currencies_by_date[$currency->date])) {
                $currencies_by_date[$currency->date] = [];
            }
            $string_code = Currency::getStringById($currency->code);
            $currencies_by_date[$currency->date][$string_code] = $currency->value;
        }

        $this->json($currencies_by_date);
    }
}
