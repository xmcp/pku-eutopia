import {useContext} from 'react';

import {to_yyyymmdd} from '../utils';
import {reservation_status} from './reservation_parser';
import {ConfigCtx} from './config_ctx';

export let DIR_KEYS_LIST = ['toyy', 'tocp'];
let DIR_KEYS_FROM_API = {'昌平->燕园': 'toyy', '燕园->昌平': 'tocp'};

let STATUS_DESC = {
    0: '已过期',
    1: '可预约',
    2: '收费',
    3: '已约满',
    4: '失效？',
    5: '未开放',
}

function to_int(s) {
    return ((typeof s) === 'number') ? s : parseInt(s, 10);
}

function date_key(s) { // yyyy-mm-dd
    return +(new Date(s));
}

function time_key(s) { // hh:mm
    return +(new Date('1970-01-01T'+s));
}

function filter_dates(ds) {
    //return Array.from(ds); /////

    let today_ts = window.EUTOPIA_USE_MOCK ? +(new Date('2022-09-08')) :  +(new Date());

    let whitelist = new Set();
    for(let delta = -1; delta<=7; delta++)
        whitelist.add(to_yyyymmdd(new Date(today_ts + delta*86400*1000)));

    return Array.from(ds).filter((s)=>whitelist.has(s));
}

export function DescribeDirectionShort({dir}) {
    let {config} = useContext(ConfigCtx);

    return (
        config.location==='yy' ?
            {toyy: '回', tocp: '去'} :
            {toyy: '去', tocp: '回'}
    )[dir] || `((${dir}))`;
}

export function DescribeDirectionLong({dir}) {
    let {config} = useContext(ConfigCtx);

    return (
        config.location==='yy' ?
            {toyy: '回燕园', tocp: '去昌平'} :
            {toyy: '去燕园', tocp: '回昌平'}
    )[dir] || `((${dir}))`;
}

export function parse_shuttle(d_shuttles, d_reservations) {
    // collect shuttle times

    let dates_set = new Set();
    let times_set = new Set();

    for(let track of d_shuttles)
        for(let cal of Object.values(track.table))
            for(let point of cal)
                if(to_int(point.row.total)>0) {
                    dates_set.add(point.date);
                    times_set.add(point.yaxis);
                }

    let dates = filter_dates(dates_set).sort((a, b) => date_key(a)-date_key(b));
    let times = Array.from(times_set).sort((a, b) => time_key(a)-time_key(b));

    // collect reservations

    let reserved = {};

    for(let r of d_reservations) {
        let status = reservation_status(r);
        if(status!=='revoked') {
            let k = r.period_text.trim();
            if(!reserved[k])
                reserved[k] = {};
            reserved[k][r.resource_id] = {id: r.id, status: status};
        }
    }

    // collect cells

    let cells = {};

    for(let track of d_shuttles)
        for(let cal of Object.values(track.table))
            for(let point of cal)
                if(to_int(point.row.total)>0) {
                    let status = point.row.status;
                    let reservation = (reserved[point.date+' '+point.yaxis] || {})[track.id] || null;
                    let cell = {
                        track_id: track.id,
                        track_name: track.name,

                        capacity: point.row.total,
                        left: point.row.margin,

                        picked: reservation,
                        passed: status===0,
                        available: status===1,
                        why_unavailable: STATUS_DESC[status] || `((${status}))`,

                        date: point.date,
                        time: point.yaxis,
                        time_id: point.time_id,
                    };

                    let key = `${point.date}/${point.yaxis}`;
                    if(!cells[key])
                        cells[key] = {};
                    let container = cells[key];

                    let dirs = track.arr_hardware_name;
                    for(let dir of dirs) {
                        let dkey = DIR_KEYS_FROM_API[dir];
                        if(dkey) {
                            if(!container[dkey])
                                container[dkey] = [];
                            container[dkey].push({
                                ...cell,
                                direction: dkey,
                            });
                        }
                    }
                }

    return {
        date_keys: dates,
        time_keys: times,
        cells: cells,
    };
}