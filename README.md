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

register(registry)  
register(path, value)  
register(path)  

ref(path): same as /@path%/  
% can be omit if the following char is not identifier chars [_A-Za-z0-9]

### save, &path%
someRewrap.save(path): same as /@someRewrap&path%/  
% can be omit if the following char is not identifier chars [_A-Za-z0-9]  
If necessary, () will be added around someRewrap to generate a sub match.

### options method
  flags, registry

### switch source style
someRewrap.re: lead the regexp style chain  
someRewrap.wrap: lead the rewrap style chain

Please dive into the code for more information. The code is simple and intuitive.

## LICENSE
MIT, see [LICENSE](https://github.com/taijiweb/rewrap/blob/master/LICENSE)
