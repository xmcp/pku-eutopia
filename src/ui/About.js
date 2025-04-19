import {useContext} from 'react';

import {SYMBOL_FAILED, DataCtx} from '../data/data_ctx';
import {ConfigCtx} from '../data/config_ctx';
import {BUILD_INFO} from '../utils';

function LastUpdate({d}) {
    if(d===null)
        return '---';

    return `${d.getHours()}:${(''+d.getMinutes()).padStart(2, '0')}:${(''+d.getSeconds()).padStart(2, '0')}`;
}

const MOTD = {
    index: null,
    list: [
        '露一手给你们看看',
        'Hey. It\'s me!',
        'Your heart 連れてくよ Higher',
        'Come on! It\'s show time!',
        '我就是那么完美 Ah!',
        'もっとAddictedに Intoxicatedに',
        'もっとMajesticに Enthusiasticに',
        'Top of the top!',
        'Top of the world!',
        'Top of the top!',
        '这地球就是绕着我转',
        '我来吸引这世界',
        '怎样，不错吧 Huh?',
    ]
}

function Preference() {
    let {config, update_config} = useContext(ConfigCtx);

    return (<>
        <p>
            <b>
                我常住在{' '}
                <select value={config.location} onChange={(e)=>update_config({
                    ...config,
                    location: e.target.value,
                })}>
                    <option value="yy">燕园</option>
                    <option value="cp">昌平</option>
                </select>
                {' '}校区
            </b>
            <br />
            （班车方向将显示为
            “<b>{config.location==='yy' ? '回' : '去'}</b>燕园”
            和
            “<b>{config.location==='yy' ? '去' : '回'}</b>昌平”
            ）
        </p>
        <p><b>
            在界面上显示班车的{' '}
            <select value={config.showtext} onChange={(e)=>update_config({
                ...config,
                showtext: e.target.value,
            })}>
                <option value="left">剩余位置</option>
                <option value="picked">已约位置</option>
            </select>
            {' '}数量
        </b></p>
        <p>
            <label>
                <input type="checkbox" checked={config.show_yesterday==='on'} onChange={(e)=>update_config({
                    ...config,
                    show_yesterday: e.target.checked ? 'on' : 'off',
                })} />
                <b>在班车时刻中显示昨天</b>
            </label>
        </p>
        <p>
            <label>
                <input type="checkbox" checked={config.auto_popup==='on'} onChange={(e)=>update_config({
                    ...config,
                    auto_popup: e.target.checked ? 'on' : 'off',
                })} />
                <b>插件载入后立即弹出签到界面或班车时刻</b>
            </label>
        </p>
    </>);
}

export function About() {
    let data = useContext(DataCtx);

    if(MOTD.index===null)
        MOTD.index = Math.floor(Math.random()*MOTD.list.length);

    return (
        <div className="eu-width-container eu-drop-shadow" style={{height: '100%'}}>
            <div className="eu-paper">
                <br />

                <h1 className="eu-title">Project Eutopia by @xmcp</h1>
                <p>班车预约 for Humans™</p>
                <p><i>「{MOTD.list[MOTD.index]}」——《Eutopia》</i></p>
                <br />

                <h1 className="eu-title">偏好设置</h1>
                <Preference />
                <br />

                <h1 className="eu-title">数据状态</h1>
                {!!(process.env.NODE_ENV!=='production' && window.EUTOPIA_USE_MOCK) &&
                    <p><b>USING MOCK DATA.</b></p>
                }
                <p>
                    预约历史：
                    {data.reservation===SYMBOL_FAILED ? '加载失败' : data.reservation===null ? '加载中' : '已加载'}
                    ，最后更新于 <LastUpdate d={data.last_update['reservation'] || null} />
                </p>
                <p>
                    本周班车：
                    {data.shuttle_thisweek===SYMBOL_FAILED ? '加载失败' : data.shuttle_thisweek===null ? '加载中' : '已加载'}
                    ，最后更新于 <LastUpdate d={data.last_update['shuttle_thisweek'] || null} />
                </p>
                <p>
                    下周班车：
                    {data.shuttle_nextweek===SYMBOL_FAILED ? '加载失败' : data.shuttle_nextweek===null ? '加载中' : '已加载'}
                    ，最后更新于 <LastUpdate d={data.last_update['shuttle_nextweek'] || null} />
                </p>
                <p>
                    <button style={{minWidth: '8em', fontSize: '1.25em'}} onClick={()=>data.reload_all(false)} disabled={data.loading}>
                        {data.loading ? '正在加载' : '更新数据'}
                    </button>
                </p>
                <br />

                <h1 className="eu-title">链接</h1>
                <p>
                    <a href="https://github.com/xmcp/pku-eutopia" target="_blank" rel="noreferrer noopener">在 GitHub 开源</a>
                    {' / '}
                    <a href="https://xmcp.ltd/donate.png" target="_blank" rel="noreferrer noopener">V 我 50</a>
                </p>
                <p>Build {BUILD_INFO}</p>
                <br />
            </div>
        </div>
    );
}