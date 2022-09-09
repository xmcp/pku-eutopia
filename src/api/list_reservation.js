import {sleep, randint} from '../utils';

export async function get_list_reservation() {
    let res = null;
    if(process.env.NODE_ENV!=='production') if(window.EUTOPIA_USE_MOCK) {
        console.log('mocking list_reservation');
        await sleep(500+randint(1500));

        res = await fetch('/mock/mocked_list_reservation.json');
    }
    if(res===null) {
        res = await fetch(
            '/site/reservation/my-list'
            +'?p=1'
            +'&page_size=100'
        );
    }

    let data = await res.json();
    if(data.e!==0)
        throw new Error(`${data.e}: ${data.m}`);

    return data.d.data;
}