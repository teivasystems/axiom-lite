import { Record } from '@servicenow/sdk/core'

// Seed data: all ServiceNow major releases, Aspen (1) through Zurich (26).
// Dates for Aspen–Geneva (seq 1–7) are approximate — verify against official SN release notes if precision matters.
// installMethod 'first install' = loaded on every deploy, idempotent by $id.

Record({ $id: Now.ID['release-aspen'],        $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Aspen',         code: 'aspen',         ga_date: '2012-01-01', sequence: 1  } })
Record({ $id: Now.ID['release-berlin'],       $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Berlin',        code: 'berlin',        ga_date: '2012-07-01', sequence: 2  } })
Record({ $id: Now.ID['release-calgary'],      $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Calgary',       code: 'calgary',       ga_date: '2013-01-01', sequence: 3  } })
Record({ $id: Now.ID['release-dublin'],       $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Dublin',        code: 'dublin',        ga_date: '2013-07-01', sequence: 4  } })
Record({ $id: Now.ID['release-eureka'],       $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Eureka',        code: 'eureka',        ga_date: '2014-01-01', sequence: 5  } })
Record({ $id: Now.ID['release-fuji'],         $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Fuji',          code: 'fuji',          ga_date: '2014-07-01', sequence: 6  } })
Record({ $id: Now.ID['release-geneva'],       $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Geneva',        code: 'geneva',        ga_date: '2015-01-01', sequence: 7  } })
Record({ $id: Now.ID['release-helsinki'],     $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Helsinki',      code: 'helsinki',      ga_date: '2016-06-01', sequence: 8  } })
Record({ $id: Now.ID['release-istanbul'],     $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Istanbul',      code: 'istanbul',      ga_date: '2016-12-01', sequence: 9  } })
Record({ $id: Now.ID['release-jakarta'],      $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Jakarta',       code: 'jakarta',       ga_date: '2017-07-01', sequence: 10 } })
Record({ $id: Now.ID['release-kingston'],     $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Kingston',      code: 'kingston',      ga_date: '2017-12-01', sequence: 11 } })
Record({ $id: Now.ID['release-london'],       $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'London',        code: 'london',        ga_date: '2018-07-01', sequence: 12 } })
Record({ $id: Now.ID['release-madrid'],       $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Madrid',        code: 'madrid',        ga_date: '2019-03-01', sequence: 13 } })
Record({ $id: Now.ID['release-new-york'],     $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'New York',      code: 'new-york',      ga_date: '2019-09-01', sequence: 14 } })
Record({ $id: Now.ID['release-orlando'],      $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Orlando',       code: 'orlando',       ga_date: '2020-04-01', sequence: 15 } })
Record({ $id: Now.ID['release-paris'],        $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Paris',         code: 'paris',         ga_date: '2020-10-01', sequence: 16 } })
Record({ $id: Now.ID['release-quebec'],       $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Quebec',        code: 'quebec',        ga_date: '2021-04-01', sequence: 17 } })
Record({ $id: Now.ID['release-rome'],         $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Rome',          code: 'rome',          ga_date: '2021-10-01', sequence: 18 } })
Record({ $id: Now.ID['release-san-diego'],    $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'San Diego',     code: 'san-diego',     ga_date: '2022-03-01', sequence: 19 } })
Record({ $id: Now.ID['release-tokyo'],        $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Tokyo',         code: 'tokyo',         ga_date: '2022-09-01', sequence: 20 } })
Record({ $id: Now.ID['release-utah'],         $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Utah',          code: 'utah',          ga_date: '2023-03-01', sequence: 21 } })
Record({ $id: Now.ID['release-vancouver'],    $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Vancouver',     code: 'vancouver',     ga_date: '2023-09-01', sequence: 22 } })
Record({ $id: Now.ID['release-washington-dc'],$meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Washington DC', code: 'washington-dc', ga_date: '2024-03-01', sequence: 23 } })
Record({ $id: Now.ID['release-xanadu'],       $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Xanadu',        code: 'xanadu',        ga_date: '2024-09-01', sequence: 24 } })
Record({ $id: Now.ID['release-yokohama'],     $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Yokohama',      code: 'yokohama',      ga_date: '2025-03-01', sequence: 25 } })
Record({ $id: Now.ID['release-zurich'],       $meta: { installMethod: 'first install' }, table: 'x_9274_axm_lite_sn_release', data: { name: 'Zurich',        code: 'zurich',        ga_date: '2025-09-01', sequence: 26 } })
