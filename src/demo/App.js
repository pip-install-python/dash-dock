/* eslint no-magic-numbers: 0 */
import React, { useState } from 'react';

import { DashDock } from '../lib';

const App = () => {

    const [state, setState] = useState({value:'', label:'Type Here'});
    const setProps = (newProps) => {
            setState(newProps);
        };

    return (
        <div>
            <DashDock
                setProps={setProps}
                {...state}
            />
        </div>
    )
};


export default App;
