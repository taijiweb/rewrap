# rewrap

a regexp wrapper, less pain and more fun with regexp :)

## feature

* compose the regexp by string, regexp, rewrap object
* compositional method
* refer to the predefined regexp
* get match by named path

## document
### install
`npm install rewrap`  

dist/rewrap.js and dist/rewrap.min.js can be used in the browser

### example

```js

    const rewrap = require('rewrap');

    const {re, wrap} = rewrap; // wrap is the same as rewrap;

    // This npm package contains some frequently used regexp.
    // It can be used as the registry for rewrap.
    const reBuiltins = require('regexp-frequent');
    rewrap.registry(reBuiltins);

    re(/^/)    // /^/
    
      .ref('digits')    // /^[0-9]+/
      
      .and(/abc/)    /^[0-9]+abc/
      
      .or(/bc/, /cd/)   // /^[0-9]+abc|bc|cd/
      
      // because the line below is leaded by re, 
      // so @digits will not refer to registry, 
      // and will generate regexp as is.
      .and(/@digits/)   // /^[0-9]+abc|bc|cd@digits/
            
      .wrap   // now switch to rewrap style
      
      // @digits will refer to registry, will be replaced by [0-9]+
      // necessary () is added automatically for or expression
      .and(/@digits/)   // /(?:^[0-9]+abc|bc|cd)@digits[0-9]+/
      
      // &a indicate that a will become (a) 
      // and will be saved as result.$$rewrapData.a while matching
      .and(/a&a/)   // /^[0-9]+abc|bc|cd@digits[0-9]+(a)/
       
      .and(
      
         // generate (xy)
         // will be saved as result.$$rewrapData.xy while matching
         // same as wrap(/(xy)&xy/)
         wrap('x').and('y').save('xy')    // /(xy)/
        
      ) //   /(?:^[0-9]+abc|bc|cd)@digits[0-9]+(a)(xy)/

      // the whole above will be saved as result.$$rewrapData. part1 while matching
      .save('part1')

      // add current rewrap to registry as sample
      .register('sample')

      // refer to sample
      .rewrap(/@sample/)    // /((?:^[0-9]+abc|bc|cd)@digits[0-9]+(a)(xy))((?:^[0-9]+abc|bc|cd)@digits[0-9]+(a)(xy))/

```

### compositional method

* rewrap, regexp, or, and, paren, not, lookAhead, optional, any, some, repeat, times, timesMore, headTail, head, tail
> they have no side effects, i.e. they always generate a new Rewrap object.
  

* not, lookAhead, optional, any, some, repeat, times, timesMore
> These methods can with/without an item argument, If without an item argument, it will operate on itself(this) and return a new Rewrap object.

### register, ref, @path%

someRewrap.register(registry)  
someRewrap.register(refPath, value)  
someRewrap.register(refPath): value is someRewrap itself  
someRewrap.register({refPath:value, ...}): register multiple refPath:value pairs  

someRewrap.ref(refPath): use the predefined rewrap in the registry(someRewrap._registry)  
someRewrap.and(/@refPath%/): use the predefined rewrap in the registry(someRewrap._registry)

refPath is like x, y, a.b.c, _a, a0.b1._c
% can be omit if the following char is not identifier chars [_A-Za-z0-9]  
NB. $ is not allowed in the refPath or dataPath(see below).  

### save, &dataPath%
someRewrap.save(dataPath): same as /@someRewrap&dataPath%/  
dataPath is like x, y, a.b.c, _a, a0.b1._c  
% can be omit if the following char is not identifier chars [_A-Za-z0-9]  
If necessary, () will be added around someRewrap to generate a sub match.

### options method
  flags, registry

### switch source style
someRewrap.re: lead the regexp style chain. In regexp style, @refPath% and @dataPath% will be treated as raw regexp string.

someRewrap.wrap: lead the rewrap style chain, @refPath% and @dataPath% will be treated like ref(refPath) and save(dataPath).

## show me the code

> Please dive into the code for more information. The code is simple and intuitive.

## two npm packages work with rewrap
### regexp-frequent
The npm package [regexp-frequent](https://github.com/taijiweb/regexp-frequent) contains some frequently used regexp. It can be used as the registry for rewrap.

### rewrap-patch
The npm package [rewrap-patch](https://github.com/taijiweb/rewrap-patch) does monkey patch on String.prototype, make the methods(match, search, split, replace) works better with rewrap. Most of time you do NOT need rewrap-patch, except that you need the match method support someString.match(aRewrap, data).

## similar npm packages
These two npm packages have similar part fearture with rewrap: save sub match with name. But rewrap is more convenient and powerful than them(no parens is necessary for name, and dot separated path is supported):  
[named-regexp:  https://www.npmjs.com/package/named-regexp](https://www.npmjs.com/package/named-regexp)  
[named-js-regexp:  https://www.npmjs.com/package/named-js-regexp](https://www.npmjs.com/package/named-regexp)  


## LICENSE
MIT, see [LICENSE](https://github.com/taijiweb/rewrap/blob/master/LICENSE)
