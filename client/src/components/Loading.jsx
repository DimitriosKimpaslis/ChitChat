import { CircularProgress } from '@mui/material';
import React from 'react';

const Loader = () => {
    return (
        <div className="h-full w-full flex justify-center items-center absolute">
            <CircularProgress />
        </div>
    );
};

export default Loader;