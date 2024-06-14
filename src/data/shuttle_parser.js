import {useContext} from 'react';

import {d_to_yyyymmdd, hhmm_to_int} from '../utils';
import {ConfigCtx} from './config_ctx';
import {normalize_track_name, reservation_info} from './common';

const DIR_INDEX = {'toyy': 0, 'tocp': 1};
const DIR_KEYS_FROM_API = {'昌平新校区': 'toyy', '燕园校区': 'tocp'};
const ID_BLACKLIST = new Set([
    13, // 新校区→200号校区
    14, // 200号校区→新校区
]);

export let STATUS_DESC = {
    0: '已过期',
    1: '可预约',
    2: '收费',
    3: '已约满',
    4: '失效？',
    5: '未开放',
}
export let STATUS_MAGIC_NUMBER = {
    PASSED: 0,
    AVAILABLE: 1,
    FUTURE: 5,
}

function to_int(s) {
    return ((typeof s) === 'number') ? s : parseInt(s, 10);
}

function date_key(s) { // yyyy-mm-dd
    return +(new Date(s));
}

function filter_dates(ds, show_yesterday) {
    //return Array.from(ds); /////

    let today_ts = +(new Date());
    if(process.env.NODE_ENV!=='production' && window.EUTOPIA_USE_MOCK) {
        today_ts = +(window.EUTOPIA_MOCK_DATE);
    }

    let whitelist = new Set();
    for(let delta = show_yesterday ? -1 : 0; delta<=7; delta++)
        whitelist.add(d_to_yyyymmdd(new Date(today_ts + delta*86400*1000)));

    return Array.from(ds).filter((s)=>whitelist.has(s));
}

function DescribeDirectionShort({dir}) {
    let {config} = useContext(ConfigCtx);

    return (
        config.location==='yy' ?
            {toyy: '回', tocp: '去'} :
            {toyy: '去', tocp: '回'}
    )[dir] || `((${dir}))`;
}

function DescribeDirectionLong({dir}) {
    let {config} = useContext(ConfigCtx);

    return (
        config.location==='yy' ?
            {toyy: '回燕园', tocp: '去昌平'} :
            {toyy: '去燕园', tocp: '回昌平'}
    )[dir] || `((${dir}))`;
}

const PX_PER_MINUTE = .75;

export function parse_shuttle(d_shuttles, d_reservations, show_yesterday) {
    let res= {
        series: [],
        yaxis: {
            max_offset: null,
            ticks: [],
        },
    };

    // collect shuttle times

    let dates_set = new Set();
    let time_min = null;
    let time_max = null;

    for(let track of d_shuttles)
        for(let cal of Object.values(track.table))
            for(let point of cal)
                if(to_int(point.row.total)>0) {
                    dates_set.add(point.date);
                    let time = hhmm_to_int(point.yaxis);
                    if(time_min===null || time_min>time)
                        time_min = time;
                    if(time_max===null || time_max<time)
                        time_max = time;
                }

    // add a slight margin
    time_min = Math.max(0, time_min-60);
    time_max = Math.min(24*60, time_max+30);

    time_min = Math.floor(time_min/60)*60; // floor to hour
    time_max = Math.ceil(time_max/60)*60; // ceil to hour

    let dates = filter_dates(dates_set, show_yesterday).sort((a, b) => date_key(a)-date_key(b));

    let date_str_to_series = {};

    dates.forEach(d => {
        let date = new Date(d);

        let is_today = date.toDateString() === (new Date()).toDateString();
        let is_yesterday = date.toDateString() === (new Date((+new Date()) - 86400*1000)).toDateString();
        let weekday_desc = '周' + '日一二三四五六日'[date.getDay()];

        let series = {
            date: d,
            title: <>
                {
                    is_today ? '今天' :
                    is_yesterday ? '昨天' :
                        weekday_desc
                }{' '}
                <small>
                    {date.getMonth()+1}-{date.getDate()}
                </small>
            </>,
            highlight: is_today,
            cols: Object.keys(DIR_INDEX).length,
            rows: [],
        };

        res.series.push(series);
        date_str_to_series[d] = series;
    });

    res.yaxis.max_offset = PX_PER_MINUTE * (time_max - time_min);

    let cur_hour = new Date().getHours();

    for(let i=time_min; i<=time_max; i+=60) {
        let h = Math.round(i/60);
        res.yaxis.ticks.push({
            name: (''+h).padStart(2, '0'),
            offset: PX_PER_MINUTE * (i - time_min),
            highlight: h===cur_hour,
        });
    }

    // collect reservations

    let reserved = {};

    for(let r of d_reservations) {
        let info = reservation_info(r);
        if(info.status!=='revoked') {
            let k = info.datetime;
            if(!reserved[k])
                reserved[k] = {};
            reserved[k][info.track_id] = info;
        }
    }

    // collect cells

    function get_cell(date_str, time_str, dir) {
        let series = date_str_to_series[date_str];
        if(!series)
            return null;

        let row = null;

        for(let r of series.rows)
            if(r.time===time_str) {
                row = r;
                break;
            }

        if(!row) { // time does not exist, create new row
            row = {
                y_offset: PX_PER_MINUTE * (hhmm_to_int(time_str) - time_min),
                time: time_str,
                cells: [],
            };
            series.rows.push(row);
        }

        for(let c of row.cells)
            if(c.index===DIR_INDEX[dir])
                return c;

        // dir does not exist, create new cell

        let cell = {
            index: DIR_INDEX[dir],
            title_long: <>
                {series.date}{' '}{time_str}{' '}
                <DescribeDirectionLong dir={dir} />
            </>,
            title_short: <DescribeDirectionShort dir={dir} />,

            // will be initialized later
            status: null,
            tot_capacity: null,
            tot_left: null,

            tracks: [],
        };
        row.cells.push(cell);
        return cell;
    }

    for(let track of d_shuttles) {
        if(ID_BLACKLIST.has(track.id))
            continue;

        for(let cal of Object.values(track.table))
            for(let point of cal)
                if(to_int(point.row.total)>0) {
                    let status = point.row.status;
                    let reservation = (reserved[point.date+' '+point.yaxis] || {})[track.id] || null;

                    let trackcell = {
                        track_id: track.id,
                        track_name: normalize_track_name(track.name),

                        capacity: to_int(point.row.total),
                        left: to_int(point.row.margin),

                        picked: reservation,
                        status_id: status,

                        date: point.date,
                        time_id: point.time_id,
                        time_text: point.yaxis,
                    };

                    let dkey = DIR_KEYS_FROM_API[track.json_address.campus_name];
                    if(dkey) {
                        let c = get_cell(point.date, point.yaxis, dkey);
                        // it is possible that c===null if track date is out of display range

                        if(c) {
                            c.tracks.push(trackcell);
                        }
                    }
                }
    }

    // finalize cell group

    for(let series of res.series) {
        series.rows.sort((a, b) => a.y_offset - b.y_offset);

        for(let row of series.rows) {
            row.cells.sort((a, b) => a.index - b.index);

            for(let cell of row.cells) {
                cell.tot_capacity = 0;
                cell.tot_left = 0;

                let picked = false;
                let passed = false;
                let available = false;

                for(let track of cell.tracks) {
                    cell.tot_capacity += track.capacity;
                    cell.tot_left += track.left;

                    if(track.picked)
                        picked = true;
                    else if(track.status_id===STATUS_MAGIC_NUMBER.PASSED)
                        passed = true;
                    else if(track.status_id===STATUS_MAGIC_NUMBER.AVAILABLE)
                        available = true;
                }

                cell.status = (
                    picked ? 'picked' :
                    available ? 'available' :
                    (!passed && cell.tot_left===0) ? 'full' :
                        'disabled'
                );
            }
        }
    }

    return res;
}