import {useState, useContext} from 'react';

import {ConfigCtx} from '../data/config_ctx';
import {ShuttleDetail} from './ShuttleDetail';
import {range0} from '../utils';

import './ShuttleTable.css';

const PILL_WIDTH = 60;
const PILL_HEIGHT = 40;

function CellGroup({cells, open_detail, has_radius_left, has_radius_right}) {
    let {config} = useContext(ConfigCtx);

    return (
        <div
            className="eu-pill"
            style={{
                height: PILL_HEIGHT + 'px',
                "--radius-left": has_radius_left ? '20px' : '0',
                "--radius-right": has_radius_right ? '20px' : '0',
            }}
        >
            {cells.map(c =>
                <div
                    key={c.index}
                    onClick={()=>open_detail(c)}
                    className={'eu-pill-item eu-color-'+c.status}
                    style={{width: PILL_WIDTH + 'px'}}
                >
                    <div className="eu-pill-itemtitle">{c.title_short}</div>
                    <div className="eu-pill-itemdesc">
                        {config.showtext==='picked' ? c.tot_capacity - c.tot_left : c.tot_left}
                    </div>
                </div>
            )}
        </div>
    );
}

function CellGroupedRow({cells, cols, y_offset, open_detail}) {
    if(cells.length===0)
        return null;

    let groups = [];
    for(let i=0; i<cells.length; i++) {
        if(i===0 || cells[i].index !== cells[i-1].index+1)
            groups.push([]);

        groups[groups.length-1].push(cells[i]);
    }

    return groups.map((g, idx) =>
        <div
            key={idx}
            className="eu-table-canvas-item"
            style={{
                left: g[0].index * PILL_WIDTH,
                top: y_offset,
            }}
        >
            <CellGroup
                cells={g} open_detail={open_detail}
                has_radius_left={g[0].index===0} has_radius_right={g[g.length-1].index===cols-1}
            />
        </div>
    );
}

export function ShuttleTable({data}) {
    let [detail, set_detail] = useState(null);

    let canvas_height = data.yaxis.max_offset + PILL_HEIGHT;

    return (<>
        <div className="eu-width-container eu-drop-shadow" style={{height: '100%'}}>
            <div className="eu-table-scroller">
                <div className="eu-table-header">
                    <div className="eu-table-timecell" />
                    {data.series.map(s =>
                        <div
                            key={s.date}
                            className={'eu-table-series' + (s.highlight ? ' eu-table-highlighted' : '')}
                            style={{width: (PILL_WIDTH * s.cols) + 'px'}}
                        >
                            <div className="eu-table-series-addon-left">[</div>
                            <div className="eu-table-series-addon-right">]</div>
                            {s.title}
                        </div>
                    )}
                </div>
                <div className="eu-table-body">
                    <div
                        className="eu-table-canvas eu-table-timecell"
                        style={{height: canvas_height + 'px'}}
                    >
                        {data.yaxis.ticks.map(t =>
                            <div
                                key={t.offset}
                                className={'eu-table-timecell eu-table-timecell-label eu-table-canvas-item' + (t.highlight ? ' eu-table-highlighted' : '')}
                                style={{
                                    height: PILL_HEIGHT + "px",
                                    lineHeight: PILL_HEIGHT + "px",
                                    top: t.offset + "px"
                                }}
                            >
                                {t.name}
                            </div>
                        )}
                    </div>
                    {data.series.map(s =>
                        <div key={s.date} className="eu-table-series" style={{width: (PILL_WIDTH * s.cols) + 'px'}}>
                            <div className="eu-table-canvas" style={{height: canvas_height + 'px'}}>
                                {range0(s.cols).map(i =>
                                    <div
                                        key={i}
                                        className="eu-table-canvas-item eu-table-timeline"
                                        style={{
                                            left: ((i+0.5) * PILL_WIDTH) + 'px',
                                            top: 0,
                                            height: canvas_height + 'px',
                                        }}
                                    />
                                )}
                                {s.rows.map(r =>
                                    <CellGroupedRow
                                        key={r.y_offset}
                                        cols={s.cols}
                                        cells={r.cells} y_offset={r.y_offset}
                                        open_detail={set_detail}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="eu-table-legend">
                    <div className="eu-table-timecell" />
                    <span className="eu-legend-box eu-color-available" /> 可预约
                    <span className="eu-legend-box eu-color-picked" /> 已预约
                    <span className="eu-legend-box eu-color-full" /> 已约满
                    <span className="eu-legend-box eu-color-disabled" /> 已过期
                </div>
            </div>
        </div>

        {detail!==null &&
            <ShuttleDetail cell={detail} close={()=>set_detail(null)} />
        }
    </>);
}