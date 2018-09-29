<?php

Namespace Cromberg\Action;

use Cromberg\Config;
use Cromberg\Functions;
use Cromberg\Template;
use Cromberg\TemplateHelper;
use Cromberg\Urls;
use DateInterval;
use DatePeriod;
use DateTime;

class StatsAction extends Action
{
    private $access;

    public function __construct($code)
    {
        parent::__construct();
        $this->access = $code === Config::$stats_code;
    }

    public function process()
    {
        if (!$this->access) {
            Functions::redirect(Urls::PAGE404);
        }

        $data_launches = $this->db->getLaunchStatsByDay();
        $data_uniques_launches = $this->db->getUniqueLaunchStatsByDay();

        $minDate = strtotime($data_launches[0]["date_str"]);
        foreach ($data_launches as $one) {
            $currentTime = strtotime($one['date_str']);

            if ($currentTime < $minDate) {
                $minDate = $currentTime;
            }
        }
        $start = new DateTime();
        $start->setTimestamp($minDate);
        $end = new DateTime('now');

        $result_day = $this->processStats($data_launches, $data_uniques_launches, $start, $end, 'day');

        $data_launches_month = $this->db->getLaunchStatsByMonth();
        $data_uniques_launches_month = $this->db->getUniqueLaunchStatsByMonth();
        $result_month = $this->processStats($data_launches_month, $data_uniques_launches_month, $start, $end, 'month');

        $page = TemplateHelper::getPageTemplate(Template::PAGE_STATS, 'Cromberg');
        $page = TemplateHelper::replaceKey('data-day', json_encode($result_day), $page);
        $page = TemplateHelper::replaceKey('data-month', json_encode($result_month), $page);
        echo $page;
    }

    private function processStats($launches_sum, $launches_uniques, $start, $end, $type) {
        if ($type === 'month') {
            $date_interval = new DateInterval('P1M');
            $date_format = 'm.Y';
        } else {
            $date_interval = new DateInterval('P1D');
            $date_format = 'd.m.Y';
        }

        $arrayByDateMonth = [];
        foreach ($launches_sum as $month) {
            $arrayByDateMonth[$month['date_str']]['sum'] = $month['number'];
        }
        foreach ($launches_uniques as $month) {
            $arrayByDateMonth[$month['date_str']]['uniques'] = $month['number'];
        }

        $period = new DatePeriod(
            $start,
            $date_interval,
            $end
        );

        $result = [];
        foreach ($period as $day) {
            $date_str = $day->format($date_format);

            $currentData = [];
            $currentData[]= $day->format(DateTime::RFC2822);
            if (isset($arrayByDateMonth[$date_str])) {
                $currentData[]= $arrayByDateMonth[$date_str]['sum'];
                $currentData[]= $arrayByDateMonth[$date_str]['uniques'];
            } else {
                $currentData[]= 0;
                $currentData[]= 0;
            }
            $result[] = $currentData;
        }

        return $result;
    }
}
