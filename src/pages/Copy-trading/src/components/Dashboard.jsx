import { useState } from 'react';
import { SegmentedControlSingleChoice } from '@deriv-com/quill-ui';
import CopierDashboard from './CopierDashboard';
import TraderDashboard from './TraderDashboard';

const Dashboard = () => {
    const [userType, setUserType] = useState('copier');

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-6xl mx-auto p-6'>
                {/* User Type Selection */}
                <div className='flex justify-center mb-8'>
                    <SegmentedControlSingleChoice
                        onChange={index => {
                            setUserType(index === 0 ? 'copier' : 'trader');
                        }}
                        options={[
                            {
                                label: 'Copy',
                            },
                            {
                                label: 'Trade',
                            },
                        ]}
                        selectedItemIndex={userType === 'copier' ? 0 : 1}
                        size='md'
                    />
                </div>

                {/* Dashboard Content */}
                {userType === 'trader' ? (
                    <TraderDashboard />
                ) : userType === 'copier' ? (
                    <CopierDashboard />
                ) : (
                    <CopierDashboard />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
