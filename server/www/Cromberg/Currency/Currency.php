<?php

namespace Cromberg\Currency;

use Cromberg\Models\CurrencyRate;

class Currency {
    const USD = 'USD';
    const EUR = 'EUR';
    const RUB = 'RUB';
    const GBP = 'GBP';
    const CHF = 'CHF';
    const BYR = 'BYR';
    const DKK = 'DKK';
    const CAD = 'CAD';
    const NOK = 'NOK';
    const SGD = 'SGD';
    const TRL = 'TRL';
    const JPY = 'JPY';
    const SEK = 'SEK';
    const UAH = 'UAH';

    const BASE_CURRENCY = self::USD;

    const CURRENCIES = [
        self::USD => 1,
        self::EUR => 2,
        self::RUB => 3,
        self::GBP => 4,
        self::CHF => 5,
        self::BYR => 6,
        self::DKK => 7,
        self::CAD => 8,
        self::NOK => 9,
        self::SGD => 10,
        self::TRL => 11,
        self::JPY => 12,
        self::SEK => 13,
        self::UAH => 14,
    ];

    public static function isAllowed(string $code) : bool {
        return isset(Currency::CURRENCIES[$code]);
    }

    public static function createCurrency(string $currency_code, $date, float $value) : CurrencyRate {
        $currency = static::getIdByString($currency_code);
        $int_value = (int)($value * 100);
        return new CurrencyRate(0, $date, $int_value, $currency);
    }

    public static function getStringById($id) {
        $byIds = array_flip(Currency::CURRENCIES);
        return $byIds[$id];
    }

    public static function getIdByString($string_code) {
        return Currency::CURRENCIES[$string_code];
    }
}
