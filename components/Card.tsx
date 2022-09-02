import React from "react";

interface IAppProps {
    children: React.ReactNode;
}

const Card: React.FC<IAppProps> = ({ children }) => {
    return (
        <div className="h-56 w-48 bg-white/10">
            { children }
        </div>
    )
}

export default Card;