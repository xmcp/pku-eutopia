import {sleep, randint, to_yyyymmdd} from '../utils';

import mocked_thisweek from './mocked_list_shuttle_thisweek.json';
import mocked_nextweek from './mocked_list_shuttle_nextweek.json';

function to_monday(d, week_delta) {
    // 'yyyy-mm-dd' for the monday of the given week of the prev date of `d``

    let dow = d.getDay();
    if (dow===0)
        dow = 7;

    let monday = new Date(d - 86400*1000 - (dow-1)*86400*1000 + week_delta*7*86400*1000);
    return to_yyyymmdd(monday);
}

export async function get_list_shuttle(week_delta) {
    let monday = to_monday(new Date(), week_delta);

    if(window.EUTOPIA_USE_MOCK) {
        console.log('mocking list_shuttle', week_delta);
        await sleep(200+randint(800));
        if(week_delta===0)
            return mocked_thisweek.d.list;
        else if(week_delta===1)
            return mocked_nextweek.d.list;
        else
            return [];
    }

    let res = await fetch(
        '/site/reservation/list-page'
        + '?hall_id=13'
        + `&time=${monday}`
    );
    let data = await res.json();
    if(data.e!==0)
        throw new Error(`${data.e}: ${data.m}`);

    return data.d.list;
}