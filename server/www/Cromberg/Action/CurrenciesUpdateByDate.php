<?php
Namespace Cromberg\Action;

use Cromberg\Currency\Currency;
use Cromberg\Currency\CurrencyRatesFetcher;

class CurrenciesUpdateByDate extends Action {
    private $time = null;

    public function __construct() {
        parent::__construct();
        $this->time = time();
    }

    function process() {
        $date_string = date('Y-m-d', $this->time);

        $rates_by_date = $this->db->getCurrenciesByDate($date_string);
        if (!empty($rates_by_date)) {
            $this->jsonError('Already filled');
            return;
        }

        $rates_fetcher = new CurrencyRatesFetcher();
        [$base, $rates] = $rates_fetcher->getRates($date_string);

        if ($base != Currency::BASE_CURRENCY) {
            $this->jsonError('Wrong base');
            return;
        }

        foreach ($rates as $rate) {
            $this->db->insertCurrency($rate);
        }
        $this->json(['status' => True]);
    }
}
