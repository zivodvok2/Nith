import React from 'react';

const TokenShimmer = () => {
    return (
        <div className='animate-pulse space-y-6'>
            {/* Add Token Button Area */}
            <div className='h-10 bg-gray-200 rounded w-32'></div>

            {/* Token List */}
            <div className='space-y-4'>
                {[1, 2].map(i => (
                    <div key={i} className='bg-white rounded-lg p-4 space-y-4'>
                        {/* Token Header */}
                        <div className='flex justify-between items-center'>
                            <div className='h-5 bg-gray-200 rounded w-1/4'></div>
                            <div className='h-8 bg-gray-200 rounded w-24'></div>
                        </div>

                        {/* Token Details */}
                        <div className='space-y-3'>
                            <div className='flex gap-4'>
                                <div className='h-4 bg-gray-200 rounded w-20'></div>
                                <div className='h-4 bg-gray-200 rounded flex-1'></div>
                            </div>
                            <div className='flex gap-4'>
                                <div className='h-4 bg-gray-200 rounded w-20'></div>
                                <div className='h-4 bg-gray-200 rounded w-1/3'></div>
                            </div>
                        </div>

                        {/* Token Actions */}
                        <div className='flex justify-end gap-2'>
                            <div className='h-8 bg-gray-200 rounded w-20'></div>
                            <div className='h-8 bg-gray-200 rounded w-20'></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TokenShimmer;
