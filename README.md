# mozimagerectpolyfill &mdash; -moz-image-rect polyfill
[-moz-image-rect](https://developer.mozilla.org/en-US/docs/Web/CSS/-moz-image-rect) is a CSS feature only implemented by Firefox.

This project is a javascript polyfill making it available for all other browsers.

An example can be [seen here](https://rawgit.com/orenyomtov/mozimagerectpolyfill/master/examples/simple.html).

## How it works
It encodes the `-moz-image-rect` value as a cross browser compatible `image/svg+xml` data-uri.

Before:
```css
body {
    background-image: -moz-image-rect(url(test.gif), 0, 50%, 50%, 0);
}
```

After:
```css
body {
    background-image: 
data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"400\" height=\"300\"><image x=\"0\" y=\"0\" xlink:href=\"data:image/gif;base64,R0lGOD...snipped...zTIgAAOw==\" /></svg>
}
```

