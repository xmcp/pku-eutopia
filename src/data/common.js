import {str_count, sleep} from '../utils';

function period_text_to_date(t) {
    if((typeof t)!=='string')
        return null;

    if(str_count(t, ':')!==1) // probably multiple time
        return null;

    let d = new Date(t.trim().replace(' ', 'T')+'+0800');

    if(isNaN(d.getFullYear()))
        return null;

    return d;
}

export function parse_period_text(pl) {
    return pl[0].time.trim();
}

const SIGNIN_TIME_ALLOWANCE_BEFORE = 61*60*1000;
const SIGNIN_TIME_ALLOWANCE_AFTER = 41*60*1000;

export function reservation_status(r) {
    if(r.status_name==='已撤销')
        return 'revoked';
    else if(r.status_name==='已签到')
        return 'finished';
    else if(r.status_name==='已预约') {
        let cur_time = +new Date();
        let d = period_text_to_date(parse_period_text(r.periodList));
        let sign_time = d ? (+d) : 0;

        if(sign_time && cur_time<sign_time+SIGNIN_TIME_ALLOWANCE_AFTER && cur_time>sign_time-SIGNIN_TIME_ALLOWANCE_BEFORE)
            return 'pending_signable';
        else if(r.is_cancel)
            return 'pending_revokable';
        else if(sign_time && cur_time>=sign_time+SIGNIN_TIME_ALLOWANCE_AFTER)
            return 'finished_absent';
        else
            return 'pending';
    } else
        return `((${r.status_name}))`;
}

export function normalize_track_name(s) {
    let rules = [
        [/(昌平新校区（马池口校园）)/g, '马池口'],
        [/昌平新校区（200号校园）/g, '200号'],
        [/燕园校区/g, '燕园'],
        [/200号校区/g, '200号'],
        [/新校区/g, '马池口'],
    ];

    for(let [from, to] of rules) {
        s = s.replace(from, to);
    }
    return s;
}

export async function with_retry(fn) {
    for(let delay of [250, 500, 1250]) {
        try {
            return await fn();
        } catch(e) {
            console.error('error, will retry after '+delay+' ms');
            console.error(e);
            await sleep(delay);
        }
    }
    return await fn();
}