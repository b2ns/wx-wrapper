/*
 * 对小程序原有工厂函数进行包装
 * 方便定义全局的配置和事件钩子
 * 方便对小程序进行增强扩展
 * 解决组件中无法自定义属性的问题
 */

const originMethods = {App, Page, Component, Behavior};
const componentLifeHooks = ['created', 'attached', 'ready', 'moved', 'detached', 'error'];

function getType(val) {
    return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
}

function genWrapper(wrapperType, wrapperConfig) {
    if (getType(wrapperConfig) !== 'object' || !Object.keys(wrapperConfig).length) {
        return originMethods[wrapperType];
    }

    return function (rawObj) {
        let backup = {}, val, type;

        Object.keys(wrapperConfig).forEach(key => {
            val = wrapperConfig[key];
            backup[key] = rawObj[key];
            type = getType(val);

            // 只有以on开头或组件生命周期函数会被包装一层，其余函数不做处理
            if (type === 'function' && (key.indexOf('on') === 0 || componentLifeHooks.indexOf(key) !== -1)) {
                rawObj[key] = function (...rest) {
                    wrapperConfig[key].call(this, rawObj);
                    backup[key] && backup[key].apply(this, rest);
                };
            } else if (type === 'array') {
                rawObj[key] = val.concat(rawObj[key] || []);
            } else if (type === 'object') {
                rawObj[key] = Object.assign(val, rawObj[key]);
            } else if (typeof rawObj[key] === 'undefined') {
                rawObj[key] = val;
            }
        });

        originMethods[wrapperType](rawObj);
    };
}

export default function wrapper(config) {
    let wrappedMethods = {};

    Object.keys(originMethods).forEach(key => {
        let tmp = wrappedMethods[key] = genWrapper(key, config[key]);
        try {
            /* eslint-disable no-global-assign */
            if (key === 'App') App = tmp;
            else if (key === 'Page') Page = tmp;
            else if (key === 'Component') Component = tmp;
            else if (key === 'Behavior') Behavior = tmp;
            /* eslint-enable no-global-assign */
        } catch (e) {}
    });

    return wrappedMethods;
}
