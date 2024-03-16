import {reservation_info} from './common';

window._eu_res_id_set = null;
export function got_res_id() {
    return window._eu_res_id_set!==null;
}
function save_res_id(s) {
    window._res_id_set = s;
}

export function parse_reservation(d_shuttles, d_reservations) {
    // collect resource ids so we know what are shuttle tracks

    let res_id = window._eu_res_id_set;

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

        let info =  reservation_info(r);

        if(info.status==='pending' || info.status==='pending_revokable' || info.status==='pending_signable')
            pending.push(info);
        else
            done.push(info);
    }

    return {
        pending: pending,
        done: done,
    }
}