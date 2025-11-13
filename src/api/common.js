import {sleep, randint} from '../utils';

function handle_session_expired() {
    // try {
    //     let last_ts = parseInt(localStorage.getItem('EUTOPIA_LAST_SESSION_EXPIRED_TS') || '0', 10);
    //     if(last_ts && (Date.now() - last_ts) < 30*1000) // re-logined within 30s, must be some bug, ignore
    //         return;
    //
    //     localStorage.setItem('EUTOPIA_LAST_SESSION_EXPIRED_TS', '' + (+Date.now()));
    // } catch(e) {
    //     console.log('cannot detect last session expired time', e);
    // }

    console.log('eutopia: redirecting to login page');
    window.location.href = '/site/login/cas-login';
}

export function check_session_on_launch() {
    if(document.cookie==='' && !location.href.includes('/login'))
        handle_session_expired();
}

export function handle_redirect(res) {
    if(res.type==='opaqueredirect') {
        handle_session_expired();
        throw new Error('网络错误（跳转）');
    }
}

export async function mock(url) {
    console.log('mocking', url);

    await sleep(750+randint(750));

    if(window.EUTOPIA_MOCK_NETWORK_ERROR && randint(3)===0)
        throw new Error('mocked network error');

    if(url!==null)
        return await fetch(url);
}