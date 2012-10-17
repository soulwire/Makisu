### Makisu

An experimental CSS 3D dropdown concept, wrapped up in a [jQuery](http://jquery.com/) plugin.

You can check out an example [here](http://soulwire.github.com/makisu.js/). You will need a CSS 3D capable browser, such as [Chrome](www.google.com/chrome).

#### Example usage

Use it like any regular jQuery plugin:

    $( '.list' ).makisu({
        selector: 'li',
        overlap: 0.2,
        speed: 0.8
    });

The options available are:

 - `selector` Children matching this selector will be _folded_ into the Makisu
 - `speed` The animation duration (in _seconds_) for each folding item
 - `overlap` Fraction of `speed	` by which folding items overlap (`0` to `1`)
 - `shading` Default shading colour (`null` for no shading)
 - `perspective` Perspective to apply to 3D transformed objects
 
#### API

Once an element has been extended as in the example above, you can `open`, `close` and `toggle` it.

	$( '.list' ).makisu( 'open' );
 
#### Trivia

The name comes from the [object](http://en.wikipedia.org/wiki/Makisu) that inspired it.
