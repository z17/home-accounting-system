<?php

namespace Cromberg\Currency;

use Cromberg\Config;

class CurrencyRatesFetcher {

    private function getUrl(string $key, string $date) {
        return  'http://api.exchangerate.host/historical?access_key=' . $key . '&date=' . $date;
    }

   public function getRates(string $date) {
        $data = file_get_contents($this->getUrl(Config::$exchangerate_key, $date));
        $parsed_data = json_decode($data);
        $base = $parsed_data->source;

        $currencies = [];
        $rates = $parsed_data->quotes;
        foreach ($rates as $code => $value) {
            $rate_code = substr($code, strlen($base));
            if  (!Currency::isAllowed($rate_code)) {
                continue;
            }
            if ($rate_code == Currency::BASE_CURRENCY) {
                continue;
            }
            $currencies[]= Currency::createCurrency($rate_code, $date, $value);
        }

       return [$base, $currencies];
   }
}
