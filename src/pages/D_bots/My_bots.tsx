import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { LegacyClose1pxIcon } from '@deriv/quill-icons/Legacy';
import { Localize } from '@deriv-com/translations';
import { useStore } from '../../hooks/useStore';
import WorkspaceControl from '../../components/load-modal/workspace-control';
import LocalFooter from '../../components/load-modal/local-footer';
import { useDevice } from '@deriv-com/ui';

const MyBots = observer(() => {
    const { dashboard, load_modal, blockly_store } = useStore();
    const { active_tab, active_tour } = dashboard;
    const { handleFileChange, loaded_local_file, setLoadedLocalFile, imported_strategy_type } = load_modal;

    const [is_file_supported, setIsFileSupported] = React.useState(true);
   const { isDesktop } = useDevice();
    const { is_loading } = blockly_store;

    const xml_files = [
        { name: 'Dalembert', file_path: '/My_xml/dalembert.xml' },
        { name: 'accumulators_martingale', file_path: '/My_xml/accumulators_martingale.xml' },
    ];

    const loadFile = async (file_path) => {
        try {
            const response = await fetch(file_path);
            const file_content = await response.text();
            const file = new Blob([file_content], { type: 'text/xml' });
            const file_object = new File([file], file_path.split('/').pop(), { type: 'text/xml' });

            const is_supported = handleFileChange({ target: { files: [file_object] } }, false);
            setIsFileSupported(is_supported);

            if (is_supported) {
                setLoadedLocalFile(file_object);
            }
        } catch (error) {
            console.error('Error loading the file:', error);
            setIsFileSupported(false);
        }
    };

    React.useEffect(() => {
        if (loaded_local_file && is_file_supported && imported_strategy_type !== 'pending' && !is_loading) {
            console.log('File loaded successfully');
        }
    }, [loaded_local_file, is_file_supported, imported_strategy_type, is_loading]);

    if (loaded_local_file && is_file_supported) {
        return (
            <div className='load-strategy__container load-strategy__container--has-footer'>
                <div
                    className={classNames('load-strategy__local-preview', {
                        'load-strategy__local-preview--active': active_tab === 1 && active_tour,
                    })}
                >
                    <div className='load-strategy__title'>
                        <Localize i18n_default_text='Preview' />
                    </div>
                    <div className='load-strategy__preview-workspace'>
                        <div id='load-strategy__blockly-container' style={{ height: '100%' }}>
                            <div className='load-strategy__local-preview-close'>
                                <LegacyClose1pxIcon
                                    onClick={() => setLoadedLocalFile(null)}
                                    height='20px'
                                    width='20px'
                                />
                            </div>
                            <WorkspaceControl />
                        </div>
                    </div>
                </div>
                {!isDesktop && (
                    <div className='load-strategy__local-footer'>
                        <LocalFooter />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className='load-strategy__container'>
            <div className='load-strategy__file-list'>
                <div className='load-strategy__title'>
                    <Localize i18n_default_text='Select a strategy file to load' />
                </div>
                <ul className='load-strategy__file-links'>
                    {xml_files.map((file) => (
                        <li key={file.name}>
                            <button
                                className='load-strategy__file-link'
                                onClick={() => loadFile(file.file_path)}
                            >
                                {file.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
});

export default MyBots;
