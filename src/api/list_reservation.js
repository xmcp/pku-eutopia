import {handle_redirect, mock} from './common';

export async function get_list_reservation() {
    let res = null;
    if(process.env.NODE_ENV!=='production') if(window.EUTOPIA_USE_MOCK) {
        res = await mock('/mock/mocked_list_reservation.json');
    }
    if(res===null) {
        res = await fetch((
            '/site/reservation/my-list'
            +'?p=1'
            +'&page_size=50'
        ), {
            redirect: 'manual',
        });
    }

    handle_redirect(res);

    let data = await res.json();
    if(data.e!==0)
        throw new Error(`${data.e}: ${data.m}`);

    return data.d.data;
}