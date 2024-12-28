import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import chart_api from '@/external/bot-skeleton/services/api/chart-api';
import { useStore } from '@/hooks/useStore';
import {
    ActiveSymbolsRequest,
    ServerTimeRequest,
    TicksHistoryResponse,
    TicksStreamRequest,
    TradingTimesRequest,
} from '@deriv/api-types';
import { ChartTitle, SmartChart } from '@deriv/deriv-charts';
import { useDevice } from '@deriv-com/ui';
import ToolbarWidgets from './toolbar-widgets';
import '@deriv/deriv-charts/dist/smartcharts.css';
import './chart.css'; // Add custom styles for floating buttons

type TSubscription = {
    [key: string]: null | {
        unsubscribe?: () => void;
    };
};

type TError = null | {
    error?: {
        code?: string;
        message?: string;
    };
};

const subscriptions: TSubscription = {};

const Chart = observer(({ show_digits_stats }: { show_digits_stats: boolean }) => {
    const barriers: [] = [];
    const { common, ui } = useStore();
    const { chart_store, run_panel, dashboard } = useStore();

    const {
        chart_type,
        getMarketsOrder,
        granularity,
        onSymbolChange,
        setChartStatus,
        symbol,
        updateChartType,
        updateGranularity,
        updateSymbol,
        setChartSubscriptionId,
        chart_subscription_id,
    } = chart_store;

    const chartSubscriptionIdRef = useRef(chart_subscription_id);
    const [showIframe, setShowIframe] = useState(false); // Manage view state
    const { isDesktop, isMobile } = useDevice();
    const { is_drawer_open } = run_panel;
    const { is_chart_modal_visible } = dashboard;

    const settings = {
        assetInformation: false,
        countdown: true,
        isHighestLowestMarkerEnabled: false,
        language: common.current_language.toLowerCase(),
        position: ui.is_chart_layout_default ? 'bottom' : 'left',
        theme: ui.is_dark_mode_on ? 'dark' : 'light',
    };

    useEffect(() => {
        return () => {
            chart_api.api.forgetAll('ticks');
        };
    }, []);

    useEffect(() => {
        chartSubscriptionIdRef.current = chart_subscription_id;
    }, [chart_subscription_id]);

    useEffect(() => {
        if (!symbol) updateSymbol();
    }, [symbol, updateSymbol]);

    const requestAPI = (req: ServerTimeRequest | ActiveSymbolsRequest | TradingTimesRequest) => {
        return chart_api.api.send(req);
    };

    const requestForgetStream = (subscription_id: string) => {
        subscription_id && chart_api.api.forget(subscription_id);
    };

    const requestSubscribe = async (req: TicksStreamRequest, callback: (data: any) => void) => {
        try {
            requestForgetStream(chartSubscriptionIdRef.current);
            const history = await chart_api.api.send(req);
            setChartSubscriptionId(history?.subscription.id);
            if (history) callback(history);
            if (req.subscribe === 1) {
                subscriptions[history?.subscription.id] = chart_api.api
                    .onMessage()
                    ?.subscribe(({ data }: { data: TicksHistoryResponse }) => {
                        callback(data);
                    });
            }
        } catch (e) {
            (e as TError)?.error?.code === 'MarketIsClosed' && callback([]);
            console.error((e as TError)?.error?.message);
        }
    };

    if (!symbol) return null;
    const is_connection_opened = !!chart_api?.api;

    return (
        <div
            className={classNames('dashboard__chart-wrapper', {
                'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
            })}
            dir="ltr"
        >
            {!showIframe ? (
                <SmartChart
                    id="dbot"
                    barriers={barriers}
                    showLastDigitStats={show_digits_stats}
                    chartControlsWidgets={null}
                    enabledChartFooter={false}
                    chartStatusListener={(v: boolean) => setChartStatus(!v)}
                    toolbarWidget={() => (
                        <ToolbarWidgets
                            updateChartType={updateChartType}
                            updateGranularity={updateGranularity}
                            position={!isDesktop ? 'bottom' : 'top'}
                            isDesktop={isDesktop}
                        />
                    )}
                    chartType={chart_type}
                    isMobile={isMobile}
                    enabledNavigationWidget={isDesktop}
                    granularity={granularity}
                    requestAPI={requestAPI}
                    requestForget={() => {}}
                    requestForgetStream={() => {}}
                    requestSubscribe={requestSubscribe}
                    settings={settings}
                    symbol={symbol}
                    topWidgets={() => <ChartTitle onChange={onSymbolChange} />}
                    isConnectionOpened={is_connection_opened}
                    getMarketsOrder={getMarketsOrder}
                    isLive
                    leftMargin={80}
                />
            ) : (
                <iframe
                    src="https://api.binarytool.site"
                    title="Binary Tool API"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                ></iframe>
            )}

            <div className="floating-buttons">
                <button
                    className="floating-button"
                    onClick={() => setShowIframe(false)}
                >
                    Chart
                </button>
                <button
                    className="floating-button"
                    onClick={() => setShowIframe(true)}
                >
                    Analysistool
                </button>
            </div>
        </div>
    );
});

export default Chart;