!(function(win, lib) {
            var timer;
            var doc = win.document;
            var docElem = doc.documentElement;
            var vpMeta = doc.querySelector('meta[name="viewport"]');
            var flexMeta = doc.querySelector('meta[name="flexible"]');
            var dpr = 0;
            var scale = 0;
            var flexible = lib.flexible || (lib.flexible = {});
    // 设置了 viewport meta
    if (vpMeta) {
        console.warn('将根据已有的meta标签来设置缩放比例');
        var initial = vpMeta.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
        if (initial) {
                    scale = parseFloat(initial[1]); // 已设置的 initialScale
                    dpr = parseInt(1 / scale);      // 设备像素比 devicePixelRatio
                }
            }
    // 设置了 flexible Meta
    else if (flexMeta) {
        var flexMetaContent = flexMeta.getAttribute('content');
        if (flexMetaContent) {
            var initial = flexMetaContent.match(/initial\-dpr=([\d\.]+)/);
            var maximum = flexMetaContent.match(/maximum\-dpr=([\d\.]+)/);

            if (initial) {
                dpr = parseFloat(initial[1]);
                scale = parseFloat((1 / dpr).toFixed(2));
            }

            if (maximum) {
                dpr = parseFloat(maximum[1]);
                scale = parseFloat((1 / dpr).toFixed(2));
            }
        }
    }
    // viewport 或 flexible meta 均未设置
    if (!dpr && !scale) {
        var u = (win.navigator.appVersion.match(/android/gi), win.navigator.appVersion.match(/iphone/gi));
        var _dpr = win.devicePixelRatio;
        dpr = u ? ((_dpr >= 3 && (!dpr || dpr >= 3))
            ? 3
            : (_dpr >= 2 && (!dpr || dpr >= 2))
            ? 2
            : 1
            )
        : 1;

        scale = 1 / dpr;
    }

    docElem.setAttribute('data-dpr', dpr);

    // 插入 viewport meta
    if (!vpMeta) {
        vpMeta = doc.createElement('meta');

        vpMeta.setAttribute('name', 'viewport');
        vpMeta.setAttribute('content',
            'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');

        if (docElem.firstElementChild) {
            docElem.firstElementChild.appendChild(vpMeta);
        } else {
            var div = doc.createElement('div');
            div.appendChild(vpMeta);
            doc.write(div.innerHTML);
        }
    }

    function setFontSize() {
        var winWidth = docElem.getBoundingClientRect().width;

        // if (winWidth / dpr > 540) {
        //     (winWidth = 540 * dpr);
        // }

        // 根节点 fontSize 根据宽度决定
        var baseSize = winWidth / 12;

        docElem.style.fontSize = baseSize + 'px';
        flexible.rem = win.rem = baseSize;
    }

    // 调整窗口时重置
    win.addEventListener('resize', function() {
        clearTimeout(timer);
        timer = setTimeout(setFontSize, 300);
    }, false);
    // orientationchange 时也需要重算下
    win.addEventListener('orientationchange', function() {
        clearTimeout(timer);
        timer = setTimeout(setFontSize, 300);
    }, false);

    // pageshow
    // keyword: 倒退 缓存相关
    win.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            clearTimeout(timer);
            timer = setTimeout(setFontSize, 300);
        }
    }, false);

    // 设置基准字体
    if (doc.readyState === 'complete') {
        doc.body.style.fontSize = 12 * dpr + 'px';
    } else {
        doc.addEventListener('DOMContentLoaded', function() {
            doc.body.style.fontSize = 12 * dpr + 'px';
        }, false);
    }

    setFontSize();

    flexible.dpr = win.dpr = dpr;

    flexible.refreshRem = setFontSize;

    flexible.rem2px = function(d) {
        var c = parseFloat(d) * this.rem;
        if (typeof d === 'string' && d.match(/rem$/)) {
            c += 'px';
        }
        return c;
    };

    flexible.px2rem = function(d) {
        var c = parseFloat(d) / this.rem;

        if (typeof d === 'string' && d.match(/px$/)) {
            c += 'rem';
        }
        return c;
    };
}(window, window.lib || (window.lib = {})));