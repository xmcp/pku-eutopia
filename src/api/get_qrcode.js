import {mock, handle_redirect} from './common';

export async function get_res_qrcode(reservation) {
    let res = null;
    if(process.env.NODE_ENV!=='production' && window.EUTOPIA_USE_MOCK) {
        res = await mock('/mock/get_res_qrcode.json');
    }
    if(res===null) {
        res = await fetch((
            '/site/reservation/get-sign-qrcode'
            +'?type=0'
            +`&id=${reservation.res_id}`
            +(reservation.appointment_id ? `&hall_appointment_data_id=${reservation.appointment_id}` : '')
        ), {
            redirect: 'manual',
        });
    }

    handle_redirect(res);

    let data = await res.json();
    if(data.e!==0)
        throw new Error(`${data.e}: ${data.m}`);

    return data.d;
}

export async function get_temp_qrcode(track_id, time_text) {
    let res = null;
    if(process.env.NODE_ENV!=='production' && window.EUTOPIA_USE_MOCK) {
        res = await mock('/mock/get_temp_qrcode.json');
    }
    if(res===null) {
        res = await fetch((
            '/site/reservation/get-sign-qrcode'
            +'?type=1'
            +`&resource_id=${track_id}`
            +`&text=${time_text}`
        ), {
            redirect: 'manual',
        });
    }

    handle_redirect(res);

    let data = await res.json();
    if(data.e!==0)
        throw new Error(`${data.e}: ${data.m}`);

    return data.d;
}