import {reservation_status, normalize_track_name, parse_period_text} from './common';

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
            track_name: normalize_track_name(r.resource_name),
            res_id: r.id,

            datetime: parse_period_text(r.periodList),

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