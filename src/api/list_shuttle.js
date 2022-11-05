import {d_to_yyyymmdd, eu_sys_version} from '../utils';
import {handle_redirect, mock} from './common';

function to_monday(d, week_delta) {
    // 'yyyy-mm-dd' for the monday of the given week of the prev date of `d``

    let dow = d.getDay();
    if (dow===0)
        dow = 7;

    let monday = new Date(d - 86400*1000 - (dow-1)*86400*1000 + week_delta*7*86400*1000);
    return d_to_yyyymmdd(monday);
}

export async function get_list_shuttle(week_delta) {
    let monday = to_monday(new Date(), week_delta);

    let res = null;
    if(process.env.NODE_ENV!=='production') if(window.EUTOPIA_USE_MOCK) {
        if(week_delta===0)
            res = await mock('/mock/mocked_list_shuttle_thisweek.json');
        else if(week_delta===1)
            res = await mock('/mock/mocked_list_shuttle_nextweek.json');
    }

    if(res===null) {
        res = await fetch((
            '/site/reservation/list-page'
            +'?hall_id=' + (eu_sys_version()===2 ? '1' : '13')
            +`&time=${monday}`
        ), {
            redirect: 'manual',
        });
    }

    handle_redirect(res);

    let data = await res.json();
    if(data.e!==0)
        throw new Error(`${data.e}: ${data.m}`);

    return data.d.list;
}