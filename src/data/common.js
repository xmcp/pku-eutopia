import {str_count} from '../utils';

function parse_period_text(t) {
    if((typeof t)!=='string')
        return null;

    if(str_count(t, ':')!==1) // probably multiple time
        return null;

    let d = new Date(t.trim().replace(' ', 'T')+'+0800');

    if(isNaN(d.getFullYear()))
        return null;

    return d;
}

export function reservation_status(r) {
    if(r.status_name==='已撤销')
        return 'revoked';
    else if(r.status_name==='已签到')
        return 'finished';
    else if(r.status_name==='已预约') {
        if(r.is_cancel)
            return 'pending_revokable';

        let d = parse_period_text(r.period_text);
        if(d===null)
            return 'pending_unkown';

        let sign_time = +d;
        let cur_time = +new Date();
        if(cur_time>sign_time+41*60*1000)
            return 'finished_absent';
        else if(cur_time>sign_time-16*60*1000)
            return 'pending_signable';
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
