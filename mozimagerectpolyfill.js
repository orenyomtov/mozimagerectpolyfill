;(function ($) {
    // First write a RegExp to match URL parts
    var reMozImageRect = /-moz-image-rect\(url\(\s*(.*?)\s*\),\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*\)/g

    function getImageDimentions(url) {
        return new Promise(resolve => {
            var img = new Image();

            img.addEventListener("load", function () {
                resolve({width: this.naturalWidth, height: this.naturalHeight});
            });

            img.src = url;
        });
    }

    function percentageToPixels(length, parentLength) {
        if (length.indexOf('%') > -1) {
            return parentLength * (parseInt(length) / 100);
        } else {
            return parseInt(length);
        }
    }

    async function mozImageRect2SVG(match) {
        var reMatch = reMozImageRect.exec(match),
            url = reMatch[1],
            top = reMatch[2],
            right = reMatch[3],
            bottom = reMatch[4],
            left = reMatch[5];


        var blob = await fetch(url).then(r => r.blob());
        var dataUrl = await new Promise(resolve => {
            let reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });

        var {width, height} = await getImageDimentions(dataUrl);

        console.log(width, height, url, top, right, bottom, left);

        var x = -percentageToPixels(left, width);
        var y = -percentageToPixels(top, height);

        var svgWidth = percentageToPixels(right, width) + x;
        var svgHeight = percentageToPixels(bottom, height) + y;

        return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="` + svgWidth + `" height="` + svgHeight + `"><image x="` + x + `" y="` + y + `" xlink:href="` + dataUrl + `" /></svg>')`;
    }

    async function transformCssValueMozImageRect2SVG(cssValue) {
        var matches = cssValue.match(reMozImageRect)
        var retValue = cssValue;

        for (var i = 0; i< matches.length; i++) {
            retValue = retValue.replace(matches[i], await mozImageRect2SVG(matches[i]));
        }

        return retValue;
    }

    function doMatched(rules) {
        rules.each(async function (rule) {
            var declarations = rule.getDeclaration();
            var relevantDeclarations = {};

            for (var declarationKey in declarations)
                // if the declaration's value has '-moz-image-rect', add it to the relevantDeclarations object,
                // and perform the "-moz-image-rect to data-uri SVG" transformation
                if (reMozImageRect.test(declarations[declarationKey]))
                    relevantDeclarations[declarationKey] = await transformCssValueMozImageRect2SVG(declarations[declarationKey]);

            $(rule.getSelectors()).css(relevantDeclarations)
        })
    }

    function undoUnmatched(rules) {
        // TODO: implement undoUnmatched
    }

    Polyfill({
        declarations: ["background-image:*"]
    })
        .doMatched(doMatched)
        .undoUnmatched(undoUnmatched);

    window.mozimagerectpolyfill = transformCssValueMozImageRect2SVG;

}(jQuery))