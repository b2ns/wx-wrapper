# wx-wrapper
包装小程序App、Page和Component等全局方法，提供全局配置和钩子能力

## 使用
这里配合[wx-computed](https://github.com/b2ns/wx-computed)来进行演示
```javascript
import wrapper from 'wx-wrapper';
import wxComputed from 'wx-computed';

wrapper({
    Page: {
        onLoad() {
            wxComputed(this);
        }
    },
    Component: {
        options: {
            // 组件接受外部全局样式
            addGlobalClass: true
        },
        attached(rawObj) {
            // 由于小程序限制, 自定义属性需手动绑定
            ['computed', 'watch'].forEach(v => this[v] = rawObj[v]);
            wxComputed(this);
        }
    }
});
```
