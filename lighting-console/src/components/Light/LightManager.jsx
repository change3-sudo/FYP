import React, { useState } from 'react';
import GeometryRenderer from '../Object/GeometryRenderer';
import AddLight from './AddLight';

const LightManager = ({ onLightAdd }) => {

    return (
        <div>
 <AddLight onLightAdd={onLightAdd} />
        </div>
    );
};

export default LightManager;