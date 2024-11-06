import React, { useState } from 'react';
import GeometryRenderer from './GeometryRenderer';
import AddObject from './AddObject';

const GeometryManager = ({ onObjectAdd }) => {

    return (
        <div>
 <AddObject addObject={onObjectAdd} />
        </div>
    );
};

export default GeometryManager;