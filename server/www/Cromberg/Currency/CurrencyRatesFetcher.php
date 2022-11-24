<?php

namespace Cromberg\Currency;

use Cromberg\Models\CurrencyRate;

class CurrencyRatesFetcher {

    private function getUrl(string $date) {
        return  'https://api.exchangerate.host/'.$date.'?base=USD';
    }

   public function getRates(string $date) {
        $data = file_get_contents($this->getUrl($date));
        $parsed_data = json_decode($data);
        $base = $parsed_data->base;

        $currencies = [];
        $rates = $parsed_data->rates;
        foreach ($rates as $rate_code => $value) {
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
