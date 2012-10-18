
/**
 * Copyright (C) 2012 by Justin Windle
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function($) {

    // Global initialisation flag
    var initialized = false;

    // For detecting browser prefix and capabilities
    var el = document.createElement( 'div' );
    var re = /^(Moz|(w|W)ebkit|O|ms)(?=[A-Z])/;

    // Establish vendor prefix and CSS 3D support
    var vendor = (function() { for ( var p in el.style ) if( re.test(p) ) return p.match(re)[0]; })() || '';
    var canRun = vendor + 'Perspective' in el.style;
    var prefix = '-' + vendor.toLowerCase() + '-';

    var $this, $root, $base, $kids, $node, $item, $over, $back;
    var wait, anim, last;

    // Public API
    var api = {

        // Toggle open / closed
        toggle: function() {

            $this = $( this );
            $this.makisu( $this.hasClass( 'open' ) ? 'close' : 'open' );
        },

        // Trigger the unfold animation
        open: function( speed, overlap, easing ) {

            // Cache DOM references
            $this = $(this);
            $root = $this.find( '.root' );
            $kids = $this.find( '.node' ).not( $root );

            // Establish values or fallbacks
            speed = utils.resolve( $this, 'speed', speed );
            easing = utils.resolve( $this, 'easing', easing );
            overlap = utils.resolve( $this, 'overlap', overlap );

            $kids.each( function( index, el ) {

                // Establish settings for this iteration
                anim = 'unfold' + ( !index ? '-first' : '' );
                last = index === $kids.length - 1;
                time = speed * ( 1 - overlap );
                wait = index * time;

                // Cache DOM references
                $item = $( el );
                $over = $item.find( '.over' );

                // Element animation
                $item.css(utils.prefix({
                    'transform': 'rotateX(180deg)',
                    'animation': anim + ' ' + speed + 's ' + easing + ' ' + wait + 's 1 normal forwards'
                }));

                // Shading animation happens when the next item starts
                if ( !last ) wait = ( index + 1 ) * time;

                // Shading animation
                $over.css(utils.prefix({
                    'animation': 'unfold-over ' + (speed * 0.45) + 's ' + easing + ' ' + wait + 's 1 normal forwards'
                }));
            });

            // Add momentum to the container
            $root.css(utils.prefix({
                'animation': 'swing-out ' + ( $kids.length * time * 1.4 ) + 's ease-in-out 0s 1 normal forwards'
            }));

            $this.addClass( 'open' );
        },

        // Trigger the fold animation
        close: function( speed, overlap, easing ) {

            // Cache DOM references
            $this = $(this);
            $root = $this.find( '.root' );
            $kids = $this.find( '.node' ).not( $root );

            // Establish values or fallbacks
            speed = utils.resolve( $this, 'speed', speed ) * 0.66;
            easing = utils.resolve( $this, 'easing', easing );
            overlap = utils.resolve( $this, 'overlap', overlap );

            $kids.each( function( index, el ) {

                // Establish settings for this iteration
                anim = 'fold' + ( !index ? '-first' : '' );
                last = index === 0;
                time = speed * ( 1 - overlap );
                wait = ( $kids.length - index - 1 ) * time;

                // Cache DOM references
                $item = $( el );
                $over = $item.find( '.over' );

                // Element animation
                $item.css(utils.prefix({
                    'transform': 'rotateX(0deg)',
                    'animation': anim + ' ' + speed + 's ' + easing + ' ' + wait + 's 1 normal forwards'
                }));

                // Adjust delay for shading
                if ( !last ) wait = ( ( $kids.length - index - 2 ) * time ) + ( speed * 0.35 );

                // Shading animation
                $over.css(utils.prefix({
                    'animation': 'fold-over ' + (speed * 0.45) + 's ' + easing + ' ' + wait + 's 1 normal forwards'
                }));
            });

            // Add momentum to the container
            $root.css(utils.prefix({
                'animation': 'swing-in ' + ( $kids.length * time * 1.0 ) + 's ease-in-out 0s 1 normal forwards'
            }));

            $this.removeClass( 'open' );
        }
    };

    // Utils
    var utils = {

        // Resolves argument values to defaults
        resolve: function( $el, key, val ) {
            return typeof val === 'undefined' ? $el.data( key ) : val;
        },

        // Prefixes a hash of styles with the current vendor
        prefix: function( style ) {
            
            for ( var key in style ) {
                style[ prefix + key ] = style[ key ];
            }

            return style;
        },

        // Inserts rules into the document styles
        inject: function( rule ) {

            try {

                var style = document.createElement( 'style' );
                style.innerHTML = rule;
                document.getElementsByTagName( 'head' )[0].appendChild( style );

            } catch ( error ) {}
        }
    };

    // Element templates
    var markup = {
        node: '<span class="node"/>',
        back: '<span class="face back"/>',
        over: '<span class="face over"/>'
    };

    // Plugin definition
    $.fn.makisu = function( options ) {

        // Notify if 3D isn't available
        if ( !canRun ) {

            var message = 'Failed to detect CSS 3D support';

            if( console && console.warn ) {
                
                // Print warning to the console
                console.warn( message );

                // Trigger errors on elements
                this.each( function() {
                    $( this ).trigger( 'error', message );
                });
            }

            return;
        }

        // Fires only once
        if ( !initialized ) {

            initialized = true;

            // Unfold
            utils.inject( '@' + prefix + 'keyframes unfold        {' +

                '0%   {' + prefix + 'transform: rotateX(180deg);  }' +
                '50%  {' + prefix + 'transform: rotateX(-30deg);  }' +
                '100% {' + prefix + 'transform: rotateX(0deg);    }' +

                '}');

            // Unfold (first item)
            utils.inject( '@' + prefix + 'keyframes unfold-first  {' +

                '0%   {' + prefix + 'transform: rotateX(-90deg);  }' +
                '50%  {' + prefix + 'transform: rotateX(60deg);   }' +
                '100% {' + prefix + 'transform: rotateX(0deg);    }' +

                '}');

            // Fold
            utils.inject( '@' + prefix + 'keyframes fold          {' +

                '0%   {' + prefix + 'transform: rotateX(0deg);    }' +
                '100% {' + prefix + 'transform: rotateX(180deg);  }' +

                '}');

            // Fold (first item)
            utils.inject( '@' + prefix + 'keyframes fold-first    {' +

                '0%   {' + prefix + 'transform: rotateX(0deg);    }' +
                '100% {' + prefix + 'transform: rotateX(-180deg); }' +

                '}');

            // Swing out
            utils.inject( '@' + prefix + 'keyframes swing-out     {' +

                '0%   {' + prefix + 'transform: rotateX(0deg);    }' +
                '30%  {' + prefix + 'transform: rotateX(-30deg);  }' +
                '60%  {' + prefix + 'transform: rotateX(15deg);   }' +
                '100% {' + prefix + 'transform: rotateX(0deg);    }' +

                '}');

            // Swing in
            utils.inject( '@' + prefix + 'keyframes swing-in      {' +

                '0%   {' + prefix + 'transform: rotateX(0deg);    }' +
                '50%  {' + prefix + 'transform: rotateX(-10deg);  }' +
                '90%  {' + prefix + 'transform: rotateX(15deg);   }' +
                '100% {' + prefix + 'transform: rotateX(0deg);    }' +

                '}');

            // Shading (unfold)
            utils.inject( '@' + prefix + 'keyframes unfold-over   {' +
                '0%   { opacity: 1.0; }' +
                '100% { opacity: 0.0; }' +
                '}');

            // Shading (fold)
            utils.inject( '@' + prefix + 'keyframes fold-over     {' +
                '0%   { opacity: 0.0; }' +
                '100% { opacity: 1.0; }' +
                '}');

            // Node styles
            utils.inject( '.node {' +
                'position: relative;' +
                'display: block;' +
                '}');

            // Face styles
            utils.inject( '.face {' +
                'pointer-events: none;' +
                'position: absolute;' +
                'display: block;' +
                'height: 100%;' +
                'width: 100%;' +
                'left: 0;' +
                'top: 0;' +
                '}');
        }

        // Merge options & defaults
        var opts = $.extend( {}, $.fn.makisu.defaults, options );

        // Extract api method arguments
        var args = Array.prototype.slice.call( arguments, 1 );

        // Main plugin loop
        return this.each( function () {

            // If the user is calling a method...
            if ( api[ options ] ) {
                return api[ options ].apply( this, args );
            }

            // Store options in view
            $this = $( this ).data( opts );

            // Only proceed if the scene hierarchy isn't already built
            if ( !$this.data( 'initialized' ) ) {

                $this.data( 'initialized', true );

                // Select the first level of matching child elements
                $kids = $this.children( opts.selector );

                // Build a scene graph for elements
                $root = $( markup.node ).addClass( 'root' );
                $base = $root;
                
                // Process each element and insert into hierarchy
                $kids.each( function( index, el ) {

                    $item = $( el );

                    // Which animation should this node use?
                    anim = 'fold' + ( !index ? '-first' : '' );

                    // Since we're adding absolutely positioned children
                    $item.css( 'position', 'relative' );

                    // Give the item some depth to avoid clipping artefacts
                    $item.css(utils.prefix({
                        'transform-style': 'preserve-3d',
                        'transform': 'translateZ(-0.1px)'
                    }));

                    // Create back face
                    $back = $( markup.back );
                    $back.css( 'background', $item.css( 'background' ) );
                    $back.css(utils.prefix({ 'transform': 'translateZ(-0.1px)' }));

                    // Create shading
                    $over = $( markup.over );
                    $over.css(utils.prefix({ 'transform': 'translateZ(0.1px)' }));
                    $over.css({
                        'background': opts.shading,
                        'opacity': 0.0
                    });
                    
                    // Begin folded
                    $node = $( markup.node ).append( $item );
                    $node.css(utils.prefix({
                        'transform-origin': '50% 0%',
                        'transform-style': 'preserve-3d',
                        'animation': anim + ' 1ms linear 0s 1 normal forwards'
                    }));

                    // Build display list
                    $item.append( $over );
                    $item.append( $back );
                    $base.append( $node );

                    // Use as parent in next iteration
                    $base = $node;
                });

                // Set root transform settings
                $root.css(utils.prefix({
                    'transform-origin': '50% 0%',
                    'transform-style': 'preserve-3d'
                }));

                // Apply perspective
                $this.css(utils.prefix({
                    'transform': 'perspective(' + opts.perspective + 'px)'
                }));

                // Display the scene
                $this.append( $root );
            }
        });
    };

    // Default options
    $.fn.makisu.defaults = {

        // Perspective to apply to rotating elements
        perspective: 1200,

        // Default shading to apply (null => no shading)
        shading: 'rgba(0,0,0,0.12)',

        // Area of rotation (fraction or pixel value)
        selector: null,

        // Fraction of speed (0-1)
        overlap: 0.6,

        // Duration per element
        speed: 0.8,

        // Animation curve
        easing: 'ease-in-out'
    };

    $.fn.makisu.enabled = canRun;

})( jQuery );