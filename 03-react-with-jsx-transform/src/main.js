import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import React, { createElement as h } from 'https://esm.sh/react';
import ReactDOM, { createRoot } from 'https://esm.sh/react-dom/client';
function Avatar({ name, status = "offline", size = 64 }) {
    let iconPath = "";
    let statusMessage = "";
    switch (status) {
        case "offline":
            iconPath = "/icons/status-offline.svg";
            statusMessage = "오프라인";
            break;
        case "online":
            iconPath = "/icons/status-online.svg";
            statusMessage = "온라인";
            break;
        case "disturb":
            iconPath = "/icons/status-disturb.svg";
            statusMessage = "방해금지";
            break;
        case "away":
            iconPath = "/icons/status-away.svg";
            statusMessage = "자리비움";
            break;
    }
    const label = `${name} (${statusMessage})`;
    return (_jsx("li", { className: "avatar", children: _jsxs("figure", { "aria-label": label, title: label, children: [_jsx("div", { className: "cover", children: _jsx("img", { src: `/avatar/${name}.png`, alt: name }) }), _jsx("figcaption", { children: _jsx("img", { src: iconPath, alt: "" }) })] }) }));
}
function AvatarListPage() {
    // JSX
    return (_jsxs("ul", { className: "avatarList", children: [_jsx(Avatar, { name: "sinzzang", status: "offline" }), _jsx(Avatar, { name: "zzanga", status: "disturb" }), _jsx(Avatar, { name: "sinpapa", status: "online" }), _jsx(Avatar, { name: "bongmiseon", status: "away" })] }));
}
const container = document.getElementById("app");
if (container) {
    const reactDomRoot = ReactDOM.createRoot(container);
    reactDomRoot.render(_jsx(AvatarListPage, {}));
}
