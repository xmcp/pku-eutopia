import {sleep, randint} from '../utils';

import mocked from './mocked_list_reservation.json';

export async function get_list_reservation() {
    if(window.EUTOPIA_USE_MOCK) {
        console.log('mocking list_reservation');
        await sleep(200+randint(800));
        return mocked.d.data;
    }

    let res = await fetch(
        '/site/reservation/my-list'
        + '?p=1'
        + '&page_size=100'
    );
    let data = await res.json();
    if(data.e!==0)
        throw new Error(`${data.e}: ${data.m}`);

    return data.d.data;
}