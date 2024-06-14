import {handle_redirect, mock} from './common';

async function get_list_reservation_per_status(status) {
    try {
        let res = await fetch((
            '/site/reservation/my-list-time'
            +'?p=1'
            +'&page_size=50'
            +'&status='+status
            +'&sort_time=true'
            +'&sort=desc'
        ), {
            redirect: 'manual',
        });

        let data = await res.json();
        if(data.e!==0)
            throw new Error(`${data.e}: ${data.m}`);

        return data.d.data;
    } catch(e) {
        console.error(e);
        return [];
    }
}

async function get_list_reservation_fallback(fallback_err) {
    let fallback_data = (await Promise.all(
        [2, 3].map(status => get_list_reservation_per_status(status))
    )).flat();

    if(fallback_data.length===0)
        throw new Error(fallback_err);

    fallback_data.sort((a, b) => b.id - a.id);
    return fallback_data;
}

export async function get_list_reservation() {
    let res = null;
    if(process.env.NODE_ENV!=='production' && window.EUTOPIA_USE_MOCK) {
        res = await mock('/mock/mocked_list_reservation.json');
    }
    if(res===null) {
        res = await fetch((
            '/site/reservation/my-list-time'
            +'?p=1'
            +'&page_size=50'
            +'&status=0'
            +'&sort_time=true'
            +'&sort=desc'
        ), {
            redirect: 'manual',
        });
    }

    handle_redirect(res);

    let data;
    try {
        data = await res.json();
        if(data.e!==0)
            throw new Error(`${data.e}: ${data.m}`);
    } catch(e) {
        let fallback_err = e.message;
        console.error('USING FALLBACK for list reservation, because:', e);
        return await get_list_reservation_fallback(fallback_err);
    }

    return data.d.data;
}