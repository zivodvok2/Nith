import React from 'react';

const StatisticsShimmer = () => {
    return (
        <div className='animate-pulse space-y-6'>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {[1, 2, 3].map(i => (
                    <div key={i} className='bg-white rounded-lg p-4 space-y-3'>
                        <div className='h-5 bg-gray-200 rounded w-1/2'></div>
                        <div className='h-8 bg-gray-200 rounded w-3/4'></div>
                    </div>
                ))}
            </div>

            {/* Chart Area */}
            <div className='bg-white rounded-lg p-4 space-y-4'>
                <div className='h-6 bg-gray-200 rounded w-1/4'></div>
                <div className='h-64 bg-gray-200 rounded'></div>
            </div>

            {/* Trade History */}
            <div className='bg-white rounded-lg p-4 space-y-4'>
                <div className='h-6 bg-gray-200 rounded w-1/3'></div>
                <div className='space-y-3'>
                    {[1, 2, 3].map(i => (
                        <div key={i} className='flex justify-between'>
                            <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                            <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                            <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatisticsShimmer;
