<?php
Namespace Cromberg\Action;

use Cromberg\Currency\Currency;
use Cromberg\Currency\CurrencyRatesFetcher;

class CurrenciesUpdateOldDates extends Action {

    public function __construct() {
        parent::__construct();
    }

    function process() {
        $this->jsonError('Forbidden');

        $start_day = '2012-09-01';
        $current_day = strtotime($start_day);
        $i = 0;
        while ($current_day < time()) {
            $date_string = date('Y-m-d', $current_day);

            $rates_by_date = $this->db->getCurrenciesByDate($date_string);
            if (!empty($rates_by_date)) {
                continue;
            }

            $rates_fetcher = new CurrencyRatesFetcher();
            [$base, $rates] = $rates_fetcher->getRates($date_string);

            if ($base != Currency::BASE_CURRENCY) {
                $this->jsonError('Wrong base');
                return;
            }

            foreach ($rates as $rate) {
                var_dump($rate);
                $this->db->insertCurrency($rate);
            }

            $current_day = strtotime('+1 day', $current_day);
            $i++;
        }
        $this->json(['status' => True]);
    }
}
