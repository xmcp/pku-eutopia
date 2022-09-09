import {str_count} from '../utils';

export function parse_period_text(t) {
    if((typeof t)!=='string')
        return null;

    if(str_count(t, ':')!==1) // probably multiple time
        return null;

    let d = new Date(t.trim().replace(' ', 'T') + '+0800');

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
        if(cur_time > sign_time + 41*60*1000)
            return 'finished_absent';
        else if(cur_time > sign_time - 16*60*1000)
            return 'pending_signable';
        else
            return 'pending';
    }
    else
        return `((${r.status_name}))`;
}

window._res_id_set = null;
export function got_res_id() {
    return window._res_id_set!==null;
}
function save_res_id(s) {
    window._res_id_set = s;
}

export function parse_reservation(d_shuttles, d_reservations) {
    // collect resource ids so we know what are tracks

    let res_id = window._res_id_set;

    if(res_id===null) {
        res_id = new Set();
        for(let track of d_shuttles)
            res_id.add(track.id);

        save_res_id(res_id);
    }

    // collect and categorize

    let pending = [];
    let done = [];

    for(let r of d_reservations) {
        if(!res_id.has(r.resource_id)) // other registration, not shuttle
            continue;

        let status = reservation_status(r);
        let info = {
            track_id: r.resource_id,
            track_name: r.resource_name,
            res_id: r.id,

            datetime: r.period_text.trim(),

            status: status,
        }

        if(status==='pending' || status==='pending_revokable' || status==='pending_signable')
            pending.push(info);
        else
            done.push(info);
    }

    return {
        pending: pending,
        done: done,
    }
}