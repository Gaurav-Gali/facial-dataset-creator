import React from 'react';
import {Loader, Play} from "lucide-react";

const PlayButton = ({loading=false} : {loading:boolean}) => {
    return (
        <div className={`bg-green-300 cursor-pointer rounded-full p-0.5 ${loading && "animate-spin"} border border-green-400`}>
            {
                loading ? <Loader className="text-green-500" size={8} /> : <Play className="text-green-500" size={8} />
            }
        </div>
    );
};

export default PlayButton;