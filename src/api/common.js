function alert_session_expired() {
    // try {
    //     let last_ts = parseInt(localStorage.getItem('EUTOPIA_LAST_SESSION_EXPIRED_TS') || '0', 10);
    //     if(last_ts && (Date.now() - last_ts) < 30*1000) // re-logined within 30s, must be some bug, ignore
    //         return;
    //
    //     localStorage.setItem('EUTOPIA_LAST_SESSION_EXPIRED_TS', '' + (+Date.now()));
    // } catch(e) {
    //     console.log('cannot detect last session expired time', e);
    // }

    window.location.href = '/site/login/cas-login';
}

export function handle_redirect(res) {
    if(res.type==='opaqueredirect') {
        alert_session_expired();
        throw new Error('网络错误（跳转）');
    }
}